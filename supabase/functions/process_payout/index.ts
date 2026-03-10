// @ts-nocheck - This is a Deno file for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.14.0"

console.log("Stripe Payout Function processing started!")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Expected Webhook Payload from Supabase (INSERT on 'withdrawals'):
 * {
 *   "type": "INSERT",
 *   "table": "withdrawals",
 *   "schema": "public",
 *   "record": {
 *     "id": "uuid",
 *     "user_id": "uuid",
 *     "amount": 50.00,
 *     "bank_details_encrypted": "acct_123456789",
 *     "status": "pending"
 *   },
 *   "old_record": null
 * }
 */

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // --- Auth: Fail closed ---
        const secret = Deno.env.get("WEBHOOK_SECRET")
        if (!secret) {
            console.error("WEBHOOK_SECRET is not configured. Rejecting request.")
            return new Response(
                JSON.stringify({ error: "Server misconfiguration: webhook secret not set" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        const signature = req.headers.get("x-webhook-secret")
        if (signature !== secret) {
            return new Response(
                JSON.stringify({ error: "Unauthorized: invalid webhook secret" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        const payload = await req.json()
        const record = payload.record

        if (!record || record.status !== 'pending') {
            return new Response("Ignored: Not a pending withdrawal", { status: 200, headers: corsHeaders })
        }

        // --- Validate amount and bank_details before calling Stripe ---
        const rawAmount = Number(record.amount)
        if (!rawAmount || rawAmount <= 0 || !isFinite(rawAmount)) {
            console.error(`Invalid withdrawal amount: ${record.amount}`)
            return new Response(
                JSON.stringify({ error: "Invalid withdrawal amount" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        const destination = record.bank_details_encrypted
        if (!destination || typeof destination !== 'string' || !destination.startsWith('acct_')) {
            console.error(`Invalid bank_details_encrypted format for withdrawal ${record.id}`)
            return new Response(
                JSON.stringify({ error: "Invalid bank details: expected Stripe connected account ID (acct_...)" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? '', {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Initialize Supabase Client with Service Role to update the withdrawal status
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { persistSession: false } }
        )

        console.log(`Processing withdrawal ${record.id} for $${rawAmount}`)

        // 1. Create a Stripe Transfer with idempotency key to prevent duplicates on retry
        const amountInCents = Math.round(rawAmount * 100)
        const idempotencyKey = `payout_${record.id}`

        const transfer = await stripe.transfers.create(
            {
                amount: amountInCents,
                currency: "usd",
                destination: destination,
                description: `Tenbox Wallet Withdrawal ${record.id}`,
            },
            {
                idempotencyKey: idempotencyKey,
            }
        )

        console.log("Stripe transfer successful:", transfer.id)

        // 2. Update the withdrawal record to 'completed'
        //    If the DB update fails AFTER a successful Stripe transfer,
        //    we must NOT mark as 'failed' — the money already moved.
        const { error: updateError } = await supabaseClient
            .from('withdrawals')
            .update({ status: 'completed' })
            .eq('id', record.id)

        if (updateError) {
            // Transfer succeeded but DB update failed — flag for manual review
            console.error(
                `CRITICAL: Stripe transfer ${transfer.id} succeeded but DB update failed for withdrawal ${record.id}:`,
                updateError
            )

            // Write an audit record for manual reconciliation
            await supabaseClient
                .from('withdrawals')
                .update({ status: 'requires_manual_review' })
                .eq('id', record.id)
                .then(({ error: auditError }) => {
                    if (auditError) {
                        console.error(`Could not flag withdrawal ${record.id} for manual review:`, auditError)
                    }
                })

            // Still return success to the caller — the Stripe transfer DID succeed
            return new Response(JSON.stringify({
                success: true,
                transfer_id: transfer.id,
                warning: "Transfer succeeded but DB status update failed. Flagged for manual review.",
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            })
        }

        return new Response(JSON.stringify({ success: true, transfer_id: transfer.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error) {
        console.error("Payout failed:", error)

        // Attempt to mark as failed — only safe because we haven't completed a Stripe transfer
        // (if we had, we would have returned success above)
        try {
            const payload = await req.clone().json()
            if (payload?.record?.id) {
                const supabaseClient = createClient(
                    Deno.env.get("SUPABASE_URL") ?? "",
                    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
                    { auth: { persistSession: false } }
                )
                await supabaseClient.from('withdrawals').update({ status: 'failed' }).eq('id', payload.record.id)
            }
        } catch (e) {
            console.error("Could not gracefully mark as failed", e);
        }

        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        })
    }
})
