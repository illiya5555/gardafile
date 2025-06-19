import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CheckoutRequest {
  price_id: string
  mode: 'payment' | 'subscription'
  success_url?: string
  cancel_url?: string
  customer_email?: string
  metadata?: Record<string, string>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe instance
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const body: CheckoutRequest = await req.json()
    const { price_id, mode, success_url, cancel_url, customer_email, metadata } = body

    if (!price_id) {
      return new Response(
        JSON.stringify({ error: 'price_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if customer exists in Stripe
    let customer_id: string | undefined

    const { data: existingCustomer } = await supabaseClient
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingCustomer) {
      customer_id = existingCustomer.customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: customer_email || user.email || '',
        metadata: {
          supabase_user_id: user.id,
        },
      })

      customer_id = customer.id

      // Save customer to database
      await supabaseClient.from('stripe_customers').insert({
        user_id: user.id,
        customer_id: customer.id,
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode,
      success_url: success_url || `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/booking`,
      metadata: {
        user_id: user.id,
        ...metadata,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      shipping_address_collection: mode === 'payment' ? {
        allowed_countries: ['IT', 'DE', 'AT', 'CH', 'FR', 'GB', 'US'],
      } : undefined,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})