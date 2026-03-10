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
 *     "bank_details": "acct_123456789", // Actually the Stripe connected account ID
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
        const signature = req.headers.get("x-webhook-secret")

        // In production, define this secret in your Supabase dashboard Edge Function secrets
        if (signature !== Deno.env.get("WEBHOOK_SECRET") && Deno.env.get("WEBHOOK_SECRET") !== undefined) {
            return new Response("Unauthorized", { status: 401, headers: corsHeaders })
        }

        const payload = await req.json()
        const record = payload.record

        if (!record || record.status !== 'pending') {
            return new Response("Ignored: Not a pending withdrawal", { status: 200, headers: corsHeaders })
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

        console.log(`Processing withdrawal ${record.id} for $${record.amount}`)

        // 1. Create a Stripe Transfer to the connected account
        // Stripe amounts are in cents, so we convert from dollars
        const amountInCents = Math.round(Number(record.amount) * 100)

        // Execute transfer
        const transfer = await stripe.transfers.create({
            amount: amountInCents,
            currency: "usd",
            destination: record.bank_details, // We assume bank_details contains the Stripe connected_account ID
            description: `Tenbox Wallet Withdrawal ${record.id}`,
        })

        console.log("Stripe transfer successful:", transfer.id)

        // 2. Update the withdrawal record to 'completed'
        const { error: updateError } = await supabaseClient
            .from('withdrawals')
            .update({ status: 'completed' })
            .eq('id', record.id)

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, transfer_id: transfer.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error) {
        console.error("Payout failed:", error)

        // Attempt to mark as failed if we have the record ID
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
