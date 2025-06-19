import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Prevent issues with URL-based session detection
  },
  global: {
    headers: {
      'X-Client-Info': 'garda-racing-app'
    },
    fetch: (url, options = {}) => {
      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
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

// Retry utility function
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Enhanced test connection function with better error handling and retry logic
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection to:', supabaseUrl);
    
    // Test with retry logic
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id')
        .limit(1);
      
      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }
      
      return data;
    });
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
    
    // Provide specific error guidance
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.name === 'AbortError') {
        console.error('Network connectivity issue detected. Please check:');
        console.error('1. Your internet connection');
        console.error('2. That your Supabase project is active and accessible');
        console.error('3. Firewall or proxy settings that might block the connection');
        console.error('4. The VITE_SUPABASE_URL is correct:', supabaseUrl);
      } else if (error.message.includes('Invalid API key')) {
        console.error('Authentication issue. Please check your VITE_SUPABASE_ANON_KEY');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('Database schema issue. The testimonials table may not exist.');
      }
    }
    
    return false;
  }
};

// Enhanced Supabase client with error handling wrapper
const createSupabaseWrapper = () => {
  const originalFrom = supabase.from.bind(supabase);
  
  supabase.from = (table: string) => {
    const query = originalFrom(table);
    const originalSelect = query.select.bind(query);
    
    query.select = (...args: any[]) => {
      const selectQuery = originalSelect(...args);
      const originalThen = selectQuery.then?.bind(selectQuery);
      
      if (originalThen) {
        selectQuery.then = (onFulfilled?: any, onRejected?: any) => {
          return originalThen(
            (result: any) => {
              if (result.error) {
                console.error(`Supabase query error on table '${table}':`, result.error);
              }
              return onFulfilled ? onFulfilled(result) : result;
            },
            (error: any) => {
              console.error(`Supabase network error on table '${table}':`, error);
              return onRejected ? onRejected(error) : Promise.reject(error);
            }
          );
        };
      }
      
      return selectQuery;
    };
    
    return query;
  };
  
  return supabase;
};

// Initialize the wrapper
createSupabaseWrapper();

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