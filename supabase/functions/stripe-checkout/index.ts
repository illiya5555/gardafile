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
    // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
    // Validate required environment variables using new names
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('PROJECT_URL'); // Было: SUPABASE_URL
    const supabaseAnonKey = Deno.env.get('PROJECT_ANON_KEY'); // Было: SUPABASE_ANON_KEY

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
      // Обновлено сообщение об ошибке для ясности
      console.error('PROJECT_URL or PROJECT_ANON_KEY environment variables are not set');
      return new Response(
        JSON.stringify({ error: 'Database configuration is missing. Please contact support.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---

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

    // Extract booking_id from metadata if it exists
    const bookingId = metadata.booking_id || null;
    
    let customerId;

    // Handle authenticated vs. non-authenticated users differently
    if (user) {
      // Authenticated user - check if customer exists in database
      const { data: customerData, error: fetchError } = await supabaseClient
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching customer data:', fetchError);
      }
      
      if (customerData?.customer_id) {
        // Customer exists, use existing customer ID
        customerId = customerData.customer_id;
        console.log('Using existing Stripe customer ID for user:', user.id);
      } else {
        // Create new customer in Stripe
        console.log('Creating new Stripe customer for user:', user.id);
        const stripeCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        });

        customerId = stripeCustomer.id;

        // Save customer to our database
        const { error: upsertError } = await supabaseClient
          .from('stripe_customers')
          .upsert({
            user_id: user.id,
            customer_id: customerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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

      console.log('Creating new Stripe customer for guest user with email:', metadata.customer_email);
      const stripeCustomer = await stripe.customers.create({
        email: metadata.customer_email,
        name: metadata.customer_name || undefined,
        metadata: {
          is_guest: 'true',
        },
      });

      customerId = stripeCustomer.id;
    }
    
    // Check if customerId is set, which it should be at this point
    if (!customerId) {
      console.error('Customer ID is undefined after processing');
      return new Response(
        JSON.stringify({ error: 'Failed to create or retrieve customer' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
    
    console.log('Using customer ID for checkout:', customerId);
    
    if (bookingId) {
      console.log('Booking ID present in session metadata:', bookingId);
    }
    
    // Remove booking_id from metadata to avoid duplication
    const { booking_id, ...stripeMetadata } = metadata;
    
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
        ...stripeMetadata
      },
    });

    // If booking ID is present, save it in payments for easy reference
    if (bookingId) {
      try {
        const { error: preCreateError } = await supabaseClient
          .from('payments')
          .insert([{
            booking_id: bookingId,
            user_id: user?.id || null,
            type: 'order',
            provider: 'stripe',
            provider_payment_id: session.payment_intent as string || 'pending',
            provider_customer_id: customerId,
            amount: ((session.amount_total || 0) / 100), // Convert from cents
            currency: session.currency || 'EUR',
            status: 'pending',
            metadata: {
              checkout_session_id: session.id,
              payment_status: session.payment_status || 'unpaid'
            }
          }]);
          
        if (preCreateError) {
          console.warn('Could not pre-create payment record:', preCreateError);
          // Continue anyway - this is not critical
        }
      } catch (paymentError) {
        console.warn('Error creating payment record:', paymentError);
        // Continue with checkout - payment record will be created by webhook
      }
    }

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