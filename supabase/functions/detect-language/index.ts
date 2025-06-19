import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DetectLanguageRequest {
  ip?: string;
  userAgent?: string;
  acceptLanguage?: string;
}

interface LocationResponse {
  country_code: string;
  country_name: string;
  ip: string;
}

// Country to language mapping
const countryLanguageMap: Record<string, string> = {
  'IT': 'it', // Italy
  'DE': 'de', // Germany
  'AT': 'de', // Austria
  'FR': 'fr', // France
  'CH': 'de', // Switzerland (German as primary)
  'ES': 'es', // Spain
  'PL': 'pl', // Poland
  'IL': 'he', // Israel
  'US': 'en', // USA
  'GB': 'en', // United Kingdom
  'NL': 'en', // Netherlands
  'CA': 'en', // Canada
  'AU': 'en', // Australia
  'UA': 'ru', // Ukraine
  'RU': 'ru', // Russia
  'BY': 'ru', // Belarus
  'KZ': 'ru', // Kazakhstan
};

const supportedLanguages = ['en', 'de', 'fr', 'it', 'es', 'pl', 'he', 'ru'];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    let detectedLanguage = 'en'; // Default fallback
    let countryCode = null;

    try {
      // Try to detect location by IP using ipapi.co
      const locationResponse = await fetch(`https://ipapi.co/${clientIP}/json/`);
      
      if (locationResponse.ok) {
        const locationData: LocationResponse = await locationResponse.json();
        countryCode = locationData.country_code;
        
        // Map country to language
        if (countryCode && countryLanguageMap[countryCode]) {
          detectedLanguage = countryLanguageMap[countryCode];
        }
      }
    } catch (error) {
      console.warn('IP-based location detection failed:', error);
    }

    // Fallback to Accept-Language header
    if (detectedLanguage === 'en') {
      const acceptLanguage = req.headers.get('accept-language');
      if (acceptLanguage) {
        const languages = acceptLanguage
          .split(',')
          .map(lang => lang.split(';')[0].split('-')[0].toLowerCase())
          .filter(lang => supportedLanguages.includes(lang));
        
        if (languages.length > 0) {
          detectedLanguage = languages[0];
        }
      }
    }

    // Get user if authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // Save language preference if user is authenticated
    if (user) {
      try {
        await supabaseClient.rpc('update_user_language', {
          p_language_code: detectedLanguage,
          p_country_code: countryCode,
          p_auto_detected: true
        });
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }

    return new Response(
      JSON.stringify({
        language: detectedLanguage,
        country_code: countryCode,
        ip: clientIP,
        supported_languages: supportedLanguages
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in detect-language function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        language: 'en', // Safe fallback
        supported_languages: supportedLanguages
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})