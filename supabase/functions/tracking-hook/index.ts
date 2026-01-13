// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    try {
        const payload = await req.json()
        const { test } = payload; // Shippo sends "test": true for test webhooks

        // Shippo Payload Structure:
        // { "data": { "tracking_number": "...", "tracking_status": { "status": "TRANSIT", ... } }, ... }
        // OR directly top-level depending on configuration, usually it is `data` wrapper for events
        const trackingData = payload.data || payload;

        const trackingNumber = trackingData.tracking_number;
        const shippoStatus = trackingData.tracking_status?.status; // PRE_TRANSIT, TRANSIT, DELIVERED, RETURNED, FAILURE, UNKNOWN

        if (!trackingNumber || !shippoStatus) {
            console.log('Valid Webhook but missing tracking info', payload);
            return new Response(JSON.stringify({ message: 'No tracking info found' }), { status: 200 })
        }

        // Map Status
        const statusMap: Record<string, string> = {
            'PRE_TRANSIT': 'pre_transit',
            'TRANSIT': 'transit',
            'DELIVERED': 'delivered',
            'RETURNED': 'returned',
            'FAILURE': 'failure',
            'UNKNOWN': 'unknown'
        };

        const newStatus = statusMap[shippoStatus] || 'unknown';

        // Update Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        const { error, count } = await supabase
            .from('shipments')
            .update({ status: newStatus })
            .eq('tracking_number', trackingNumber)
            .select('*', { count: 'exact' }); // Get count to see if we found it

        if (error) {
            console.error('Database Update Error:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 })
        }

        console.log(`Updated shipment ${trackingNumber} to ${newStatus}. Rows affected: ${count}`);

        return new Response(JSON.stringify({ success: true, updated: count }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error) {
        console.error('Webhook Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
})
