// @ts-nocheck - This is a Deno file for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from 'https://esm.sh/stripe@14.14.0'


const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
    amount: number;
    currency: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        const token = authHeader?.replace(/^Bearer\s+/i, '')
        if (!token) {
            throw new Error('Unauthorized')
        }
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase server credentials')
        }
        
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            throw new Error('Stripe secret key is not configured');
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false }
        })
        const { data: authData, error: authError } = await supabase.auth.getUser(token)
        if (authError || !authData.user?.email) {
            throw new Error('Unauthorized')
        }

        const body: RequestBody = await req.json()
        const { amount, currency } = body
        const email = authData.user.email
        const name = authData.user.user_metadata?.full_name || undefined

        if (!amount || !currency) {
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
