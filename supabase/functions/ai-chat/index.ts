import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  message: string;
  conversationId?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Mock AI response function - in a real implementation, this would call Google's API
async function generateAIResponse(message: string, previousMessages: Message[] = []): Promise<string> {
  // In a real implementation, we would call Google's Vertex AI API here
  
  // For this example, we're providing a simple Russian greeting
  // This simulates what would be returned by the Google AI service
  
  const responses = [
    "Привет! Я помощник Garda Racing Yacht Club в Рива-дель-Гарда. У нас проходят ежедневные регаты на быстрых яхтах J70. Можно присоединиться в любую дату, даже если ты никогда не гонял — на борту будет шкипер! Участие от 195€. Хочешь посмотреть доступные даты?",
    "На нашем сайте вы можете забронировать место в регате уже сегодня. Стоимость участия — от 195€ за человека, включая профессионального шкипера, все снаряжение и медали победителям. Какую дату вы рассматриваете для участия?",
    "Garda Racing Yacht Club — это новый способ попробовать яхтинг и участвовать в регатах на современных яхтах J70. Мы находимся в Рива-дель-Гарда, на озере Гарда в Италии. Наши регаты доступны новичкам. Могу я помочь вам с бронированием?"
  ];
  
  // Choose a response based on the message content
  let responseIndex = 0;
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("дата") || lowerMessage.includes("когда") || 
      lowerMessage.includes("бронирование") || lowerMessage.includes("цена")) {
    responseIndex = 1;
  } else if (lowerMessage.includes("что") || lowerMessage.includes("клуб") || 
             lowerMessage.includes("где") || lowerMessage.includes("как")) {
    responseIndex = 2;
  }
  
  return responses[responseIndex];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse the request body
    const { message, conversationId } = await req.json() as RequestBody;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get previous messages from the conversation if there's a conversationId
    let previousMessages: Message[] = [];
    if (conversationId) {
      // In a real implementation, we would fetch previous messages from the database
      // For now, we'll just use an empty array
    }

    // Get response from AI
    const aiResponse = await generateAIResponse(message, previousMessages);

    // Store messages in the database
    try {
      // Store user message
      await supabase.from('chat_messages').insert({
        message: message,
        sender_type: 'user',
        created_at: new Date().toISOString()
      });

      // Store AI response
      await supabase.from('chat_messages').insert({
        message: aiResponse,
        sender_type: 'bot',
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
      // Log the error but don't fail the request
      console.error("Error saving chat messages to database:", dbError);
    }

    // Return the response
    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in AI chat function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process your request",
        details: error.message 
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