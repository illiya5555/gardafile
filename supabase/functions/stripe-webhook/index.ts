import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    )

    console.log(`Processing webhook event: ${event.type}`)

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
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    if (session.mode === 'payment') {
      // Handle one-time payment
      const { error } = await supabase.from('stripe_orders').upsert({
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
      }
    } else if (session.mode === 'subscription') {
      // Handle subscription - this will be processed by subscription events
      console.log('Subscription checkout completed:', session.subscription)
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const paymentMethod = subscription.default_payment_method
    let paymentMethodData = null

    if (paymentMethod && typeof paymentMethod === 'string') {
      const pm = await stripe.paymentMethods.retrieve(paymentMethod)
      paymentMethodData = {
        brand: pm.card?.brand,
        last4: pm.card?.last4,
      }
    }

    const { error } = await supabase.from('stripe_subscriptions').upsert({
      customer_id: subscription.customer as string,
      subscription_id: subscription.id,
      price_id: subscription.items.data[0]?.price.id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      payment_method_brand: paymentMethodData?.brand,
      payment_method_last4: paymentMethodData?.last4,
      status: subscription.status,
    })

    if (error) {
      console.error('Error upserting subscription:', error)
    }
  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const { error } = await supabase
      .from('stripe_subscriptions')
      .update({
        status: 'canceled',
        deleted_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscription.id)

    if (error) {
      console.error('Error updating deleted subscription:', error)
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription) {
      // Update subscription status
      const { error } = await supabase
        .from('stripe_subscriptions')
        .update({ status: 'active' })
        .eq('subscription_id', invoice.subscription)

      if (error) {
        console.error('Error updating subscription on payment success:', error)
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription) {
      // Update subscription status
      const { error } = await supabase
        .from('stripe_subscriptions')
        .update({ status: 'past_due' })
        .eq('subscription_id', invoice.subscription)

      if (error) {
        console.error('Error updating subscription on payment failure:', error)
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}