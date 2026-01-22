// @ts-nocheck

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SHIPPO_API_KEY = Deno.env.get('SHIPPO_API_KEY')

// Common carriers for auto-detection
const CARRIER_PATTERNS: Record<string, RegExp> = {
    'shippo': /^SHIPPO_/i, // Shippo test tracking numbers
    'usps': /^(9[0-9]{15,21}|[0-9]{20,22}|[A-Z]{2}[0-9]{9}US)$/i,
    'ups': /^1Z[A-Z0-9]{16}$/i,
    'fedex': /^[0-9]{12,22}$/,
    'dhl_express': /^[0-9]{10,11}$/,
}

function detectCarrier(trackingNumber: string): string {
    for (const [carrier, pattern] of Object.entries(CARRIER_PATTERNS)) {
        if (pattern.test(trackingNumber)) {
            return carrier
        }
    }
    // Default to usps for unknown formats (most common in US)
    return 'usps'
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
            }
        })
    }

    try {
        const { tracking_number, carrier: providedCarrier } = await req.json()

        if (!tracking_number) {
            return new Response(JSON.stringify({ error: 'Tracking number is required' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            })
        }

        if (!SHIPPO_API_KEY) {
            throw new Error('Missing SHIPPO_API_KEY')
        }

        // Use provided carrier or auto-detect (now always returns a value)
        const carrier = providedCarrier || detectCarrier(tracking_number)

        // The previous check for `!carrier` is no longer needed because `detectCarrier` always returns a string.
        // If `providedCarrier` is null/undefined, `detectCarrier` will provide a default.

        // Call Shippo Tracking API
        const response = await fetch(`https://api.goshippo.com/tracks/${carrier}/${tracking_number}`, {
            method: 'GET',
            headers: {
                'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        // Normalize the response for frontend
        if (data.tracking_status) {
            const normalizedData = {
                tracking_number: data.tracking_number,
                carrier: data.carrier,
                status: data.tracking_status.status?.toLowerCase() || 'unknown',
                status_details: data.tracking_status.status_details || '',
                status_date: data.tracking_status.status_date,
                location: data.tracking_status.location ?
                    `${data.tracking_status.location.city || ''}, ${data.tracking_status.location.state || ''} ${data.tracking_status.location.country || ''}`.trim() :
                    'Unknown',
                estimated_delivery: data.eta,
                origin: data.address_from ?
                    `${data.address_from.city || ''}, ${data.address_from.country || ''}`.trim() :
                    null,
                destination: data.address_to ?
                    `${data.address_to.city || ''}, ${data.address_to.country || ''}`.trim() :
                    null,
                events: (data.tracking_history || []).map((event: any) => ({
                    date: event.status_date,
                    status: event.status?.toLowerCase() || 'unknown',
                    description: event.status_details || event.status || 'Update',
                    location: event.location ?
                        `${event.location.city || ''}, ${event.location.state || ''} ${event.location.country || ''}`.trim() :
                        'Unknown'
                }))
            }

            return new Response(JSON.stringify(normalizedData), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            })
        }

        // If no tracking status, return the raw error or empty result
        return new Response(JSON.stringify({
            error: data.messages?.[0]?.text || 'Tracking information not found',
            raw: data
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    }
})
