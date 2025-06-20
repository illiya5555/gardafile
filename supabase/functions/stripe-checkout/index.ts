import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    // Parse the request body
    const { price_id, mode = 'payment', success_url, cancel_url, metadata = {} } = await req.json();

    if (!price_id) {
      throw new Error('Price ID is required')
    }

    let customerId;

    // Handle authenticated vs. non-authenticated users differently
    if (user) {
      // Authenticated user - check if customer exists in database
      let { data: customerData } = await supabaseClient
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .single();

      customerId = customerData?.customer_id;

      // If customer doesn't exist in our database, create one in Stripe
      if (!customerId) {
        const stripeCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        });

        customerId = stripeCustomer.id;

        // Save customer to our database
        const { error: insertError } = await supabaseClient
          .from('stripe_customers')
          .insert({
            user_id: user.id,
            customer_id: customerId,
          });

        if (insertError) {
          console.error('Error saving customer to database:', insertError);
          throw new Error('Failed to save customer data');
        }
      }
    } else {
      // Non-authenticated user - create a temporary Stripe customer using email from metadata
      if (!metadata.customer_email) {
        throw new Error('Customer email is required for non-authenticated users');
      }

      const stripeCustomer = await stripe.customers.create({
        email: metadata.customer_email,
        name: metadata.customer_name || undefined,
        metadata: {
          is_guest: 'true',
        },
      });

      customerId = stripeCustomer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: success_url || `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/booking`,
      metadata: {
        user_id: user?.id || 'guest',
        ...metadata
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})