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

// Connection status tracker
let connectionStatus: 'unknown' | 'connected' | 'disconnected' = 'unknown';
let lastConnectionTest = 0;
const CONNECTION_TEST_INTERVAL = 60000; // 1 minute

// Get connection status
export const getConnectionStatus = () => connectionStatus;

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
      console.warn(`Supabase connection attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Enhanced test connection function with cached results
export const testConnection = async () => {
  // Return cached result if recent
  const now = Date.now();
  if (connectionStatus !== 'unknown' && (now - lastConnectionTest) < CONNECTION_TEST_INTERVAL) {
    return connectionStatus === 'connected';
  }

  try {
    console.log('Testing Supabase connection...');
    
    // Simple connection test without retries for faster response
    const { error } = await supabase
      .from('testimonials')
      .select('id')
      .limit(1);
    
    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }
    
    connectionStatus = 'connected';
    lastConnectionTest = now;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    connectionStatus = 'disconnected';
    lastConnectionTest = now;
    
    // Only log detailed error info in development
    if (import.meta.env.DEV) {
      console.warn('Supabase connection failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: supabaseUrl
      });
    }
    
    return false;
  }
};

// Safe query wrapper that handles connection issues gracefully
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T | null = null
): Promise<{ data: T | null; error: any; isOffline: boolean }> => {
  try {
    // Quick connection check
    if (connectionStatus === 'disconnected') {
      return {
        data: fallbackData,
        error: { message: 'Offline mode - using cached data' },
        isOffline: true
      };
    }

    const result = await queryFn();
    
    if (result.error) {
      connectionStatus = 'disconnected';
      return {
        data: fallbackData,
        error: result.error,
        isOffline: true
      };
    }
    
    connectionStatus = 'connected';
    return {
      data: result.data,
      error: null,
      isOffline: false
    };
  } catch (error) {
    connectionStatus = 'disconnected';
    return {
      data: fallbackData,
      error: { message: error instanceof Error ? error.message : 'Connection failed' },
      isOffline: true
    };
  }
};

// Retry-enabled query for critical operations
export const retryQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T | null = null,
  maxRetries: number = 2
): Promise<{ data: T | null; error: any; isOffline: boolean }> => {
  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      return data;
    }, maxRetries);
    
    connectionStatus = 'connected';
    const queryResult = await queryFn();
    
    return {
      data: queryResult.data,
      error: queryResult.error,
      isOffline: false
    };
  } catch (error) {
    connectionStatus = 'disconnected';
    
    return {
      data: fallbackData,
      error: { message: error instanceof Error ? error.message : 'Connection failed' },
      isOffline: true
    };
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