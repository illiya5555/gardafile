import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

serve(async (req) => {
  try {
    // Validate required environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // SMTP configuration
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'info@gardaracing.com';

    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return new Response('Stripe configuration is missing', { status: 500 })
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET environment variable is not set');
      return new Response('Webhook configuration is missing', { status: 500 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase environment variables are not set');
      return new Response('Database configuration is missing', { status: 500 })
    }

    if (!smtpUser || !smtpPass) {
      console.error('SMTP environment variables are not set');
      console.warn('Email confirmation will not be sent');
      // Still continue processing the webhook, just won't send emails
    }

    // Initialize Stripe and Supabase
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Missing stripe-signature header', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Error verifying webhook signature:', err.message)
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
      })
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase, {
            smtpHost,
            smtpPort,
            smtpUser, 
            smtpPass,
            emailFrom
          })
          break
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionChange(event.data.object as Stripe.Subscription, stripe, supabase)
          break
        
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
          break
        
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
          break
        
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Error in webhook handler:', error)
    return new Response('Internal server error', { status: 500 })
  }
})

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser?: string;
  smtpPass?: string;
  emailFrom: string;
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session, 
  supabase: any, 
  emailConfig: EmailConfig
) {
  console.log('Checkout session completed:', session.id)

  // Update booking status if booking_id is present in metadata
  if (session.metadata?.booking_id) {
    try {
      console.log('Updating booking status for booking ID:', session.metadata.booking_id);
      
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', session.metadata.booking_id)
        .select()
        .single();
        
      if (bookingError) {
        console.error('Error updating booking status:', bookingError)
        // Continue with order processing even if booking update fails
      } else {
        console.log('Booking status updated to confirmed')
        
        // Check if an email has already been sent for this booking
        if (!bookingData.email_sent && emailConfig.smtpUser && emailConfig.smtpPass) {
          // Send confirmation email
          await sendConfirmationEmail(bookingData, 'booking_confirmation', emailConfig);
          
          // Update email_sent status
          const { error: updateError } = await supabase
            .from('bookings') // <-- ISPRAVLENO: reservations -> bookings
            .update({ email_sent: true })
            .eq('id', session.metadata.booking_id);
            
          if (updateError) {
            console.error('Error updating email_sent status:', updateError)
          }
        }
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      // Continue with order processing even if booking update fails
    }
  }

  if (session.mode === 'payment') {
    // Handle one-time payment
    console.log('Creating payment record for one-time payment:', session.id);
    
    const { error } = await supabase
      .from('payments')
      .insert([{
        booking_id: session.metadata?.booking_id || null,
        user_id: session.metadata?.user_id !== 'guest' ? session.metadata?.user_id : null,
        type: 'order',
        provider: 'stripe',
        provider_payment_id: session.payment_intent as string,
        provider_customer_id: session.customer as string,
        amount: ((session.amount_total || 0) / 100), // Convert from cents to whole currency units
        currency: session.currency || 'eur',
        status: 'completed',
        metadata: {
          checkout_session_id: session.id,
          payment_status: session.payment_status,
          amount_subtotal: session.amount_subtotal,
        },
        completed_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error creating payment record:', error)
      throw error
    }
  } else if (session.mode === 'subscription') {
    // Subscription will be handled by subscription.created event
    console.log('Subscription checkout completed, waiting for subscription.created event')
  }
}

async function sendConfirmationEmail(booking: any, type: string, config: EmailConfig) {
  const bookingId = booking.id;
  try {
    console.log('Sending confirmation email for booking:', bookingId);

    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: config.smtpHost,
      port: config.smtpPort,
      username: config.smtpUser,
      password: config.smtpPass,
    });

    // Format date for display - updated field name from booking_date to date
    const bookingDate = new Date(booking.date).toLocaleDateString('ru-RU', { // <-- ISPRAVLENO: booking_date -> date
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const subject = `Garda Racing - Подтверждение бронирования #${bookingId.substring(0, 8)}`;
    const content = `...`; // Email content is the same, so I've omitted it for brevity

    await client.send({
      from: config.emailFrom,
      to: booking.customer_email,
      subject: subject,
      html: content,
    });

    await client.close();
    console.log('Confirmation email sent successfully');

    // Update email_sent flag for confirmation emails
    if (type === 'booking_confirmation') {
      await supabase
        .from('bookings') // <-- ISPRAVLENO: reservations -> bookings
        .update({ email_sent: true })
        .eq('id', bookingId);
    }

  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

// =================================================================
// ALL FOLLOWING FUNCTIONS ARE NOW CORRECTED AND FULLY IMPLEMENTED
// =================================================================

async function handleSubscriptionChange(subscription: Stripe.Subscription, stripe: Stripe, supabase: any) {
  console.log('Subscription changed:', subscription.id)

  // Initialize payment data with common fields
  let paymentData: Record<string, any> = {
    type: 'subscription',
    provider: 'stripe',
    provider_payment_id: subscription.id,
    provider_customer_id: subscription.customer as string,
    amount: 0, // Subscription amount is handled differently
    currency: 'eur',
    status: subscription.status === 'active' ? 'completed' : 
           subscription.status === 'canceled' ? 'cancelled' : 'pending',
    metadata: {
      subscription_id: subscription.id,
      price_id: subscription.items.data[0]?.price.id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
  };

  // Add payment method details to metadata
  if (subscription.default_payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        subscription.default_payment_method as string
      )
      
      if (paymentMethod.card) {
        paymentData.metadata.payment_method_brand = paymentMethod.card.brand;
        paymentData.metadata.payment_method_last4 = paymentMethod.card.last4;
      }
    } catch (error) {
      console.error('Error retrieving payment method:', error)
    }
  }
  
  // Try to find the user_id from stripe_customers table
  try {
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', subscription.customer)
      .maybeSingle();
    
    if (customerData) {
      paymentData.user_id = customerData.user_id;
    }
  } catch (error) {
    console.error('Error retrieving user_id:', error);
  }

  // Set completed_at if subscription is active
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    paymentData.completed_at = new Date().toISOString();
  }

  // Update or create payment record for this subscription
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('provider', 'stripe')
    .eq('provider_payment_id', subscription.id)
    .maybeSingle();
  
  let error;
  
  if (existingPayment) {
    // Update existing payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', existingPayment.id);
    
    error = updateError;
  } else {
    // Create new payment record
    const { error: insertError } = await supabase
      .from('payments')
      .insert([paymentData]);
    
    error = insertError;
  }

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log('Subscription deleted:', subscription.id)
  
  // Update the payment status to cancelled
  const { error } = await supabase
    .from('payments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('provider_payment_id', subscription.id)
    .eq('provider', 'stripe')
    .eq('type', 'subscription')

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log('Invoice payment succeeded:', invoice.id)

  // Create a new payment record for this invoice payment
  const paymentData: Record<string, any> = {
    type: 'order',
    provider: 'stripe',
    provider_payment_id: invoice.payment_intent as string,
    provider_customer_id: invoice.customer as string,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency,
    status: 'completed',
    metadata: {
      invoice_id: invoice.id,
      subscription_id: invoice.subscription,
      invoice_number: invoice.number,
    },
    completed_at: new Date().toISOString()
  };

  // Try to find the user_id from stripe_customers
  try {
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', invoice.customer)
      .maybeSingle();
    
    if (customerData) {
      paymentData.user_id = customerData.user_id;
    }
  } catch (error) {
    console.error('Error retrieving user_id:', error);
  }

  // Create payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert([paymentData]);

  if (paymentError) {
    console.error('Error creating invoice payment record:', paymentError);
  }

  // Update subscription payment status if needed
  if (invoice.subscription) {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('provider', 'stripe')
      .eq('provider_payment_id', invoice.subscription)
      .eq('type', 'subscription');

    if (error) {
      console.error('Error updating subscription after payment success:', error);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log('Invoice payment failed:', invoice.id)

  // Create a failed payment record
  const paymentData: Record<string, any> = {
    type: 'order',
    provider: 'stripe',
    provider_payment_id: invoice.payment_intent as string,
    provider_customer_id: invoice.customer as string,
    amount: invoice.amount_due / 100, // Convert from cents
    currency: invoice.currency,
    status: 'failed',
    metadata: {
      invoice_id: invoice.id,
      subscription_id: invoice.subscription,
      invoice_number: invoice.number,
      failure_message: invoice.last_payment_error?.message || 'Payment failed'
    }
  };

  // Try to find the user_id from stripe_customers
  try {
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', invoice.customer)
      .maybeSingle();
    
    if (customerData) {
      paymentData.user_id = customerData.user_id;
    }
  } catch (error) {
    console.error('Error retrieving user_id:', error);
  }

  // Create payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert([paymentData]);

  if (paymentError) {
    console.error('Error creating failed invoice payment record:', paymentError);
  }

  // Update subscription payment status
  if (invoice.subscription) {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('provider', 'stripe')
      .eq('provider_payment_id', invoice.subscription)
      .eq('type', 'subscription');

    if (error) {
      console.error('Error updating subscription after payment failure:', error)
    }
  }
}