import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}

// Сохранение данных в базу данных Supabase
async function saveToDatabase(formData: ContactFormData, supabaseClient: any) {
  try {
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

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error saving to database:", error);
    throw error;
  }
}

// Основная функция обработки запроса
serve(async (req) => {
  // Настройка CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Обработка preflight запросов
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Проверка метода запроса
    if (req.method !== "POST") {
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
    const formData: ContactFormData = await req.json();
    
    // Валидация данных
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
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
    const telegramResponse = await sendTelegramMessage(formData);
    
    // Создаем клиент Supabase с сервисной ролью для записи в базу данных
    const supabaseClient = Deno.env.get("SUPABASE_URL") && Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") 
      ? createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        )
      : null;
    
    // Сохраняем в базу данных, если клиент Supabase доступен
    let dbResponse = null;
    if (supabaseClient) {
      dbResponse = await saveToDatabase(formData, supabaseClient);
    }

    // Возвращаем успешный ответ
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

// Функция для создания клиента Supabase
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      insert: (data: any) => {
        return fetch(`${supabaseUrl}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(data)
        }).then(res => {
          if (!res.ok) return res.json().then(err => { throw err });
          return { error: null };
        });
      }
    })
  };
}