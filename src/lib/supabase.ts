import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation for environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    urlValue: supabaseUrl,
    keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set with real values from your Supabase dashboard.');
}

// Check for placeholder values
if (supabaseUrl.includes('your-project-ref') || supabaseAnonKey.includes('your-anon-key')) {
  console.error('Placeholder values detected in environment variables');
  throw new Error('Please replace the placeholder values in your .env file with actual Supabase credentials from your dashboard (Settings → API).');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid VITE_SUPABASE_URL format. Please ensure it follows the pattern: https://your-project-ref.supabase.co');
}

// Create a custom fetch implementation with better error handling
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options?.headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Client-Info': 'supabase-js/2.39.0',
      }
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.error('Network fetch error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: url.toString(),
      timestamp: new Date().toISOString()
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your internet connection and Supabase project status');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed - please verify your internet connection and that your Supabase project URL is correct');
      }
    }
    
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'garda-racing-app'
    },
    fetch: customFetch
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Enhanced connection test function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection to:', supabaseUrl);
    
    // First test basic connectivity
    const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (!healthCheck.ok) {
      console.error('Supabase health check failed:', healthCheck.status, healthCheck.statusText);
      return false;
    }
    
    // Test database query
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase database test failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey,
      timestamp: new Date().toISOString()
    });
    
    // Provide helpful debugging information
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Connection troubleshooting steps:');
      console.error('1. Check your internet connection');
      console.error('2. Verify VITE_SUPABASE_URL in .env file matches your project URL from Supabase dashboard');
      console.error('3. Verify VITE_SUPABASE_ANON_KEY in .env file matches your anon key from Supabase dashboard');
      console.error('4. Ensure your Supabase project is active and not paused');
      console.error('5. Restart your development server after updating .env file');
    }
    
    return false;
  }
};

// Database types
export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  booking_date: string;
  time_slot: string;
  participants: number;
  total_price: number;
  deposit_paid: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  max_participants: number;
  price_per_person: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id?: string;
  message: string;
  sender_type: 'user' | 'bot';
  created_at: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export interface CorporatePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  participants_range: string;
  duration: string;
  features: string[];
  is_popular: boolean;
  created_at: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface CorporateInquiry {
  id: string;
  package_id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  participants_count: number;
  preferred_date?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'quoted' | 'confirmed' | 'cancelled';
  created_at: string;
}

// New yacht booking interface
export interface YachtBooking {
  id: string;
  yacht_id: string;
  user_id?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  participants: number;
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

// Yacht interface
export interface Yacht {
  id: string;
  name: string;
  model: string;
  capacity: number;
  hourly_rate: number;
  is_active: boolean;
  description?: string;
  image_url?: string;
  created_at: string;
}