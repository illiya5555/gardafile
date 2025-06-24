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
          await sendConfirmationEmail(bookingData, emailConfig);
          
          // Update email_sent status
          const { error: updateError } = await supabase
            .from('reservations')
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

async function sendConfirmationEmail(booking: any, config: EmailConfig) {
  try {
    console.log('Sending confirmation email for booking:', booking.id)

    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: config.smtpHost,
      port: config.smtpPort,
      username: config.smtpUser,
      password: config.smtpPass,
    });

    // Format date for display
    const bookingDate = new Date(booking.booking_date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Build email subject and content
    const subject = `Garda Racing - Подтверждение бронирования #${booking.id.substring(0, 8)}`;
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .booking-details { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
          .button { display: inline-block; background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Спасибо за ваш заказ!</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${booking.customer_name}</strong>!</p>
            <p>Благодарим вас за бронирование яхтенной регаты с Garda Racing. Ваша оплата успешно получена, и мы рады подтвердить вашу регату.</p>
            
            <div class="booking-details">
              <h3>Детали бронирования:</h3>
              <p><strong>Номер бронирования:</strong> ${booking.id.substring(0, 8)}</p>
              <p><strong>Дата:</strong> ${bookingDate}</p>
              <p><strong>Время:</strong> ${booking.time_slot}</p>
              <p><strong>Количество участников:</strong> ${booking.participants}</p>
              <p><strong>Общая стоимость:</strong> €${booking.total_price}</p>
            </div>
            
            <p>Вы можете войти в свой личный кабинет, чтобы просмотреть детали бронирования:</p>
            <p><strong>Email:</strong> ${booking.customer_email}</p>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get('SITE_URL') || 'https://gardaracing.com'}/dashboard" class="button">Перейти в личный кабинет</a>
            </p>
            
            <p>Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами:</p>
            <p><strong>Телефон:</strong> +39 344 777 00 77</p>
            <p><strong>Email:</strong> info@gardaracing.com</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Garda Racing Yacht Club. Все права защищены.</p>
            <p>Viale Giancarlo Maroni 4, 38066 Riva del Garda TN, Italia</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await client.send({
      from: config.emailFrom,
      to: booking.customer_email,
      subject: subject,
      content: content,
      html: content,
    });

    await client.close();
    console.log('Confirmation email sent successfully')
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return false;
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, stripe: Stripe, supabase: any) {
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

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
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

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
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

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
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