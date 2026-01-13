// @ts-nocheck

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SHIPPO_API_KEY = Deno.env.get('SHIPPO_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    try {
        const { rate_id, user_id, shipment_details } = await req.json()

        if (!SHIPPO_API_KEY) throw new Error('Missing SHIPPO_API_KEY')

        // 1. Purchase Label from Shippo
        const response = await fetch(`https://api.goshippo.com/transactions/`, {
            method: 'POST',
            headers: {
                'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rate: rate_id,
                label_file_type: "PDF",
                async: false
            })
        })

        const transaction = await response.json()

        if (transaction.status !== 'SUCCESS') {
            const shippoMsg = transaction.messages?.[0];
            const errorText = typeof shippoMsg === 'string'
                ? shippoMsg
                : shippoMsg?.text || 'Failed to purchase label';
            throw new Error(errorText)
        }

        // 2. Save to Supabase (using Service Role to bypass RLS if needed, or just insert)
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        const { error } = await supabase
            .from('shipments')
            .insert({
                user_id: user_id,
                tracking_number: transaction.tracking_number,
                carrier: transaction.rate.provider,
                status: 'pre_transit',
                label_url: transaction.label_url,
                items_summary: shipment_details?.items || 'Package',
                origin: shipment_details?.origin || 'Unknown',
                destination: shipment_details?.destination || 'Unknown',
                estimated_delivery: 'Pending'
            })

        if (error) throw error

        return new Response(JSON.stringify({ success: true, tracking_number: transaction.tracking_number }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })

    } catch (error: any) {
        // Return 200 with error field to avoid generic "non-2xx" client errors
        return new Response(JSON.stringify({ error: error.message }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    }
})
