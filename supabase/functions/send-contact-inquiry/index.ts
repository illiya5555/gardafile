import { createClient } from 'npm:@supabase/supabase-js@2';

// Telegram bot token и chat ID из переменных окружения
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "7559788864:AAE_mi25gJJPONPxyE6zFfqSRJVf1mxNbL4";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || "5217243018";

// Интерфейс для данных контактной формы
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Функция для отправки сообщения в Telegram
async function sendTelegramMessage(formData: ContactFormData) {
  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  // Форматируем сообщение для Telegram с использованием HTML разметки
  const message = `
<b>🔔 Новая заявка с сайта!</b>

<b>Имя:</b> ${formData.name}
<b>Email:</b> ${formData.email}
<b>Телефон:</b> ${formData.phone || 'Не указан'}
<b>Тема:</b> ${formData.subject}

<b>Сообщение:</b>
${formData.message}

<i>Отправлено: ${new Date().toLocaleString()}</i>
`;

  try {
    console.log('Sending message to Telegram');
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API response not OK:', response.status, errorText);
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }
    
    console.log('Telegram message sent successfully');
    return data;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}

// Сохранение данных в базу данных Supabase
async function saveToDatabase(formData: ContactFormData, supabaseClient: any) {
  try {
    console.log('Saving contact inquiry to database');
    const { error } = await supabaseClient
      .from('contact_inquiries')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
        status: 'new'
      });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Contact inquiry saved to database');
    return { success: true };
  } catch (error) {
    console.error("Error saving to database:", error);
    throw error;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Основная функция обработки запроса
Deno.serve(async (req) => {
  console.log('Received request:', req.method, req.url);
  
  // Обработка preflight запросов
  if (req.method === "OPTIONS") {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Проверка метода запроса
    if (req.method !== "POST") {
      console.log('Method not allowed:', req.method);
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Получение данных из запроса
    let formData: ContactFormData;
    try {
      formData = await req.json();
      console.log('Received form data:', formData);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Валидация данных
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Отправка сообщения в Telegram
    let telegramResponse = null;
    try {
      telegramResponse = await sendTelegramMessage(formData);
    } catch (telegramError) {
      console.error("Telegram error:", telegramError);
      // Продолжаем выполнение даже если Telegram не работает
    }
    
    // Создаем клиент Supabase с сервисной ролью для записи в базу данных
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log('Supabase URL available:', !!supabaseUrl);
    console.log('Supabase service key available:', !!supabaseServiceKey);
    
    let dbResponse = null;
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        dbResponse = await saveToDatabase(formData, supabaseClient);
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Если база данных не работает, но Telegram работает, все равно возвращаем успех
        if (!telegramResponse) {
          throw dbError;
        }
      }
    } else {
      console.warn("Supabase environment variables not found");
    }

    // Возвращаем успешный ответ
    console.log('Returning success response');
    return new Response(
      JSON.stringify({ 
        success: true, 
        telegramResponse,
        dbResponse
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Возвращаем ошибку
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error" 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});