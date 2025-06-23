import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

interface EmailParams {
  bookingId: string;
  type?: 'booking_confirmation' | 'reminder' | 'cancellation';
}

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
    // Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'info@gardaracing.com';
    
    // Validate required env vars
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    }
    
    if (!smtpUser || !smtpPass) {
      throw new Error('Missing required environment variables: SMTP_USER, SMTP_PASS');
    }
    
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request parameters
    const { bookingId, type = 'booking_confirmation' } = await req.json() as EmailParams;
    
    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Retrieve booking details
    const { data: booking, error: bookingError } = await supabase
      .from('reservations')
      .select(`
        *,
        customer_name,
        customer_email,
        booking_date,
        time_slot,
        participants,
        total_price,
        status
      `)
      .eq('id', bookingId)
      .single();
    
    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found', details: bookingError }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if email was already sent (for booking confirmation)
    if (type === 'booking_confirmation' && booking.email_sent) {
      return new Response(
        JSON.stringify({ message: 'Email already sent for this booking', sent: false }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Initialize SMTP client
    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
    });
    
    // Format date for display
    const bookingDate = new Date(booking.booking_date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Build email content based on type
    let subject, content;
    
    if (type === 'booking_confirmation') {
      subject = `Garda Racing - Подтверждение бронирования #${booking.id.substring(0, 8)}`;
      content = `
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
    } else if (type === 'reminder') {
      // One day before reminder
      subject = `Garda Racing - Напоминание о вашем бронировании завтра`;
      content = `
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
              <h1>Напоминание о вашей регате завтра!</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, <strong>${booking.customer_name}</strong>!</p>
              <p>Напоминаем, что ваша яхтенная регата с Garda Racing состоится <strong>завтра, ${bookingDate}</strong>.</p>
              
              <div class="booking-details">
                <h3>Детали бронирования:</h3>
                <p><strong>Номер бронирования:</strong> ${booking.id.substring(0, 8)}</p>
                <p><strong>Дата:</strong> ${bookingDate}</p>
                <p><strong>Время:</strong> ${booking.time_slot}</p>
                <p><strong>Количество участников:</strong> ${booking.participants}</p>
              </div>
              
              <p><strong>Что взять с собой:</strong></p>
              <ul>
                <li>Удобную одежду</li>
                <li>Солнцезащитный крем</li>
                <li>Солнечные очки</li>
                <li>Кепку или шляпу</li>
                <li>Бутылку воды</li>
                <li>Сменную одежду</li>
              </ul>
              
              <p>Если у вас возникли какие-либо вопросы или вам нужно внести изменения, пожалуйста, свяжитесь с нами:</p>
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
    } else if (type === 'cancellation') {
      subject = `Garda Racing - Подтверждение отмены бронирования`;
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4B5563; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .booking-details { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
            .button { display: inline-block; background-color: #4B5563; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Подтверждение отмены бронирования</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, <strong>${booking.customer_name}</strong>!</p>
              <p>Мы подтверждаем отмену вашего бронирования на яхтенную регату с Garda Racing.</p>
              
              <div class="booking-details">
                <h3>Детали отмененного бронирования:</h3>
                <p><strong>Номер бронирования:</strong> ${booking.id.substring(0, 8)}</p>
                <p><strong>Дата:</strong> ${bookingDate}</p>
                <p><strong>Время:</strong> ${booking.time_slot}</p>
              </div>
              
              <p>Если у вас есть вопросы или вы хотите забронировать новую дату, пожалуйста, свяжитесь с нами:</p>
              <p><strong>Телефон:</strong> +39 344 777 00 77</p>
              <p><strong>Email:</strong> info@gardaracing.com</p>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get('SITE_URL') || 'https://gardaracing.com'}/booking" class="button">Забронировать новую дату</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Garda Racing Yacht Club. Все права защищены.</p>
              <p>Viale Giancarlo Maroni 4, 38066 Riva del Garda TN, Italia</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    // Send the email
    await client.send({
      from: emailFrom,
      to: booking.customer_email,
      subject: subject,
      content: content,
      html: content,
    });
    
    await client.close();
    
    // Update email_sent flag for confirmation emails
    if (type === 'booking_confirmation') {
      await supabase
        .from('reservations')
        .update({ email_sent: true })
        .eq('id', bookingId);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});