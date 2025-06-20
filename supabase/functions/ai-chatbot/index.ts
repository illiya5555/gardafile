import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

interface reqPayload {
  message: string;
  conversationContext?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const VERTEX_AI_SECRET_KEY = Deno.env.get('VERTEX_AI_SECRET_KEY');
    
    if (!VERTEX_AI_SECRET_KEY) {
      console.error("VERTEX_AI_SECRET_KEY is not set");
      throw new Error("API key configuration is missing");
    }

    // Parse the request body
    const { message, conversationContext = [] } = await req.json() as reqPayload;

    if (!message || typeof message !== 'string') {
      throw new Error("Message is required and must be a string");
    }
    
    // For this implementation, we'll use a simple structure
    // but the actual integration depends on the specific AI service API
    
    // Prepare the request to the AI service
    const response = await simulateAiResponse(message, VERTEX_AI_SECRET_KEY, conversationContext);

    // Return the AI response
    return new Response(
      JSON.stringify({ response }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing your request"
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});

// This is a placeholder function for demonstration
// Replace this with the actual API call to your Vertex AI service
async function simulateAiResponse(message: string, apiKey: string, context: string[] = []): Promise<string> {
  console.log(`Using API key: ${apiKey.substring(0, 3)}...`);
  console.log(`Processing message: ${message}`);
  
  // This is where you would make a call to your AI service API
  // The implementation depends on the specific Vertex AI endpoint you're using
  
  // For now, we'll simulate different responses based on message content
  if (message.toLowerCase().includes("book") || message.toLowerCase().includes("reserv")) {
    return "You can book your yacht racing experience directly on our website by visiting the booking page. Would you like me to provide more information about available dates or pricing?";
  }
  
  if (message.toLowerCase().includes("price") || message.toLowerCase().includes("cost")) {
    return "Our standard yacht racing experience is €195 per person. This includes a professional skipper, all equipment, insurance, and a medal ceremony. Corporate packages and group rates are also available. Would you like to know more?";
  }
  
  if (message.toLowerCase().includes("weather") || message.toLowerCase().includes("conditions")) {
    return "Lake Garda offers perfect sailing conditions with reliable winds. Typically, we experience wind speeds of 8-15 knots and temperatures of 18-28°C during sailing season. If conditions are unsafe, we'll reschedule your experience at no extra cost.";
  }
  
  if (message.toLowerCase().includes("cancel")) {
    return "Our cancellation policy allows free cancellation up to 48 hours before your scheduled experience. You can manage your booking through your account or contact us directly at +39 344 777 00 77 for assistance.";
  }
  
  // Default response
  return "Thank you for your question about Garda Racing! Our team will assist you shortly. If you'd like immediate help, please call us at +39 344 777 00 77 or visit our booking page to reserve your yacht racing experience.";
}