// @ts-nocheck - This is a Deno file for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.14.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
    amount: number;
    currency: string;
    email: string;
    name?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body: RequestBody = await req.json()
        const { amount, currency, email, name } = body

        if (!amount || !currency || !email) {
            throw new Error('Missing required fields')
        }

        // 1. Create or retrieve customer
        let customerId;
        const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });

        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;
        } else {
            const newCustomer = await stripe.customers.create({
                email: email,
                name: name,
            });
            customerId = newCustomer.id;
        }

        // 2. Ephemeral Key (allows the app to temporarily manage this customer's methods)
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerId },
            { apiVersion: '2023-10-16' }
        )

        // 3. Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to cents
            currency: currency,
            customer: customerId,
            automatic_payment_methods: {
                enabled: true,
            },
        })

        return new Response(
            JSON.stringify({
                paymentIntent: paymentIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customer: customerId,
                publishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY'),
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
