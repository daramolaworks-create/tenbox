// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
    // No OPTIONS handling for webhook endpoint

    try {
        const rawBody = await req.text();
        const secret = Deno.env.get('SHIPPO_WEBHOOK_SECRET');
        const signature = req.headers.get('Shippo-Signature');

        // Verify Signature if secret is configured
        if (secret) {
            if (!signature) {
                console.error('❌ Missing Shippo-Signature header');
                return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 401 });
            }

            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(secret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );

            const signatureBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
            const computedSignature = Array.from(new Uint8Array(signatureBuf))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            if (computedSignature !== signature) {
                console.error('❌ Invalid Shippo Signature. Computed:', computedSignature, 'Received:', signature);
                return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
            }
            console.log('✅ Webhook signature verified');
        } else {
            console.warn('⚠️ SHIPPO_WEBHOOK_SECRET not set. Skipping signature verification.');
        }

        const payload = JSON.parse(rawBody);
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
