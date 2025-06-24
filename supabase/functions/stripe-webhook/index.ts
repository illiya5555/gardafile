
// --- Функция: stripe-webhook ---
// Назначение: Получает события от Stripe (например, об успешной оплате),
// обновляет базу данных и отправляет email с подтверждением.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.5.0';
// Для отправки email, если понадобится. Убедитесь, что настроили SMTP секреты.
// import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Главная функция-обработчик ---
serve(async (req) => {
  // Вебхуки Stripe не требуют CORS, но для единообразия оставим заголовки
  const handleResponse = (body: object, status: number) => {
    return new Response(JSON.stringify(body, null, 2), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  };

  try {
    // 1. Получение секретов из окружения
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET'); // Важно! Этот секрет дает Stripe.
    const supabaseUrl = Deno.env.get('PROJECT_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // Используем Service Key для полных прав

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables for webhook.');
      return handleResponse({ error: "Server configuration error." }, 500);
    }
    
    // 2. Инициализация клиентов
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Проверка подписи Stripe
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature) {
      console.error('Stripe signature missing!');
      return handleResponse({ error: 'Stripe signature missing!' }, 400);
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return handleResponse({ error: 'Webhook signature verification failed.' }, 400);
    }

    // 4. Обработка события в зависимости от его типа
    const data = event.data.object;
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed');
        const session = data as Stripe.Checkout.Session;
        
        // Обновляем статус бронирования в базе данных
        if (session.metadata?.booking_id) {
          const { error: bookingError } = await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', session.metadata.booking_id);

          if (bookingError) {
            console.error(`Failed to update booking ${session.metadata.booking_id}`, bookingError);
            // Не прерываем выполнение, т.к. запись о платеже важнее
          } else {
            console.log(`Booking ${session.metadata.booking_id} status updated to confirmed.`);
            // Здесь можно добавить логику отправки email
          }
        }
        
        // Создаем запись о платеже в таблице 'payments'
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
              status: 'completed',
              provider_payment_id: session.payment_intent as string,
              completed_at: new Date().toISOString()
          })
          .eq('metadata->>checkout_session_id', session.id); // Находим предсозданную запись

        if (paymentError) {
            console.error(`Failed to update payment record for session ${session.id}`, paymentError);
        } else {
            console.log(`Payment record for session ${session.id} updated.`);
        }
        break;

      // Можно добавить обработчики для других событий (подписки, возвраты и т.д.)
      // case 'customer.subscription.created':
      //   // ...
      //   break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return handleResponse({ received: true }, 200);

  } catch (error) {
    console.error('General error in webhook handler:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
});