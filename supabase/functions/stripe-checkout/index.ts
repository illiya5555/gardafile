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
    // Validate required environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'Stripe configuration is missing. Please contact support.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are not set');
      return new Response(
        JSON.stringify({ error: 'Database configuration is missing. Please contact support.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
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
    const { 
      price_id, 
      mode = 'payment', 
      success_url, 
      cancel_url, 
      metadata = {} 
    } = await req.json();

    // Check for undefined price_id
    if (price_id === undefined) {
      return new Response(
        JSON.stringify({ error: 'price_id is not defined' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (typeof price_id !== 'string' || price_id.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    let customerId;

    // Handle authenticated vs. non-authenticated users differently
    if (user) {
      // Authenticated user - check if customer exists in database
      let { data: customerData, error: fetchError } = await supabaseClient
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching customer data:', fetchError);
      }

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

        // Save customer to our database using upsert to handle duplicates
        const { error: upsertError } = await supabaseClient
          .from('stripe_customers')
          .upsert({
            user_id: user.id,
            customer_id: customerId
          }, {
            onConflict: 'user_id'
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error('Error saving customer to database:', upsertError);
          console.error('Details:', JSON.stringify(upsertError));
          return new Response(
            JSON.stringify({ error: 'Failed to save customer data' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }
      }
    } else {
      // Non-authenticated user - create a temporary Stripe customer using email from metadata
      if (!metadata.customer_email) {
        return new Response(
          JSON.stringify({ error: 'Customer email is required for non-authenticated users' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
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

    // Extract booking_id from metadata if it exists
    const bookingId = metadata.booking_id || null;
    
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
        booking_id: bookingId,
        user_id: user?.id || 'guest',
        ...metadata
      },
    });

    // Track Google Ads begin_checkout event
    console.log('Tracking begin_checkout event for Google Ads');

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    // Provide more specific error messages based on error type
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;

    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request to Stripe. Please check your configuration.';
      statusCode = 400;
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed. Please contact support.';
      statusCode = 500;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    )
  }
})