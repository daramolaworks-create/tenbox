
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SHIPPO_API_KEY = Deno.env.get('SHIPPO_API_KEY')

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    try {
        const { address_to, address_from, parcels, items } = await req.json()

        if (!SHIPPO_API_KEY) {
            throw new Error('Missing SHIPPO_API_KEY')
        }

        const shipmentPayload: any = {
            address_to,
            address_from,
            parcels,
            async: false
        };

        // Auto-generate basic customs declaration for international shipments
        // Logic: If countries differ, add customs.
        if (address_to.country !== address_from.country && address_to.country !== 'EU') {
            shipmentPayload.customs_declaration = {
                contents_type: 'MERCHANDISE',
                contents_explanation: items?.[0]?.description || 'Merchandise',
                non_delivery_option: 'RETURN',
                certify: true,
                certify_signer: address_from.name || 'Sender',
                items: items ? items.map((item: any) => ({
                    description: item.description || 'Merchandise',
                    quantity: parseInt(item.quantity) || 1,
                    net_weight: (parseFloat(item.weight) || 1).toString(),
                    mass_unit: 'kg',
                    value_amount: (parseFloat(item.value) || 10).toString(),
                    value_currency: 'USD',
                    origin_country: address_from.country
                })) : parcels.map((p: any) => ({
                    description: 'Merchandise',
                    quantity: 1,
                    net_weight: p.weight,
                    mass_unit: p.mass_unit,
                    value_amount: '10',
                    value_currency: 'USD',
                    origin_country: address_from.country
                }))
            }
        }

        const response = await fetch('https://api.goshippo.com/shipments/', {
            method: 'POST',
            headers: {
                'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shipmentPayload)
        })

        const data = await response.json()

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    }
})
