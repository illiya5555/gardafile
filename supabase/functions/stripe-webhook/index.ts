import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    console.error('Error verifying webhook signature:', err.message)
    return new Response(`Webhook signature verification failed: ${err.message}`, {
      status: 400,
    })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
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
})

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)

  if (session.mode === 'payment') {
    // Handle one-time payment
    const { error } = await supabase
      .from('stripe_orders')
      .insert({
        checkout_session_id: session.id,
        payment_intent_id: session.payment_intent as string,
        customer_id: session.customer as string,
        amount_subtotal: session.amount_subtotal || 0,
        amount_total: session.amount_total || 0,
        currency: session.currency || 'eur',
        payment_status: session.payment_status,
        status: 'completed',
      })

    if (error) {
      console.error('Error inserting order:', error)
      throw error
    }
  } else if (session.mode === 'subscription') {
    // Subscription will be handled by subscription.created event
    console.log('Subscription checkout completed, waiting for subscription.created event')
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Subscription changed:', subscription.id)

  const subscriptionData = {
    customer_id: subscription.customer as string,
    subscription_id: subscription.id,
    price_id: subscription.items.data[0]?.price.id,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: subscription.cancel_at_period_end,
    status: subscription.status,
  }

  // Get payment method details
  if (subscription.default_payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        subscription.default_payment_method as string
      )
      
      if (paymentMethod.card) {
        subscriptionData.payment_method_brand = paymentMethod.card.brand
        subscriptionData.payment_method_last4 = paymentMethod.card.last4
      }
    } catch (error) {
      console.error('Error retrieving payment method:', error)
    }
  }

  const { error } = await supabase
    .from('stripe_subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'customer_id'
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)

  const { error } = await supabase
    .from('stripe_subscriptions')
    .update({ 
      status: 'canceled',
      deleted_at: new Date().toISOString()
    })
    .eq('subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  if (invoice.subscription) {
    // Update subscription status if needed
    const { error } = await supabase
      .from('stripe_subscriptions')
      .update({ status: 'active' })
      .eq('subscription_id', invoice.subscription)

    if (error) {
      console.error('Error updating subscription after payment success:', error)
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  
  if (invoice.subscription) {
    // Update subscription status
    const { error } = await supabase
      .from('stripe_subscriptions')
      .update({ status: 'past_due' })
      .eq('subscription_id', invoice.subscription)

    if (error) {
      console.error('Error updating subscription after payment failure:', error)
    }
  }
}