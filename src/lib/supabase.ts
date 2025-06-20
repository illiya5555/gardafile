import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with better error messages
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined in environment variables');
  console.error('📝 Please check your .env file and ensure it contains:');
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined in environment variables');
  console.error('📝 Please check your .env file and ensure it contains:');
  console.error('   VITE_SUPABASE_ANON_KEY=your_anon_key');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.');
}

// Validate URL format with more detailed error
try {
  const url = new URL(supabaseUrl);
  if (!url.hostname.includes('supabase.co') && !url.hostname.includes('localhost')) {
    console.warn('⚠️  URL does not appear to be a Supabase URL:', supabaseUrl);
  }
  console.log('✅ Supabase URL format is valid:', supabaseUrl);
} catch (error) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl);
  console.error('📝 Expected format: https://your-project.supabase.co');
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
}

// Validate anon key format
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.warn('⚠️  Anon key does not appear to be in correct JWT format');
  console.warn('📝 Expected format: eyJ... (should start with eyJ)');
}

console.log('🔧 Initializing Supabase client...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
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

// Enhanced test connection function with better error reporting
export const testConnection = async () => {
  const now = Date.now();
  if (connectionStatus !== 'unknown' && (now - lastConnectionTest) < CONNECTION_TEST_INTERVAL) {
    return connectionStatus === 'connected';
  }

  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Use a more reliable test - just ping the auth endpoint
    const { data, error } = await supabase
      .from('translations')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      throw new Error(`Supabase query error: ${error.message}`);
    }
    
    connectionStatus = 'connected';
    lastConnectionTest = now;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    connectionStatus = 'disconnected';
    lastConnectionTest = now;
    
    console.error('❌ Supabase connection failed');
    console.error('🔧 Troubleshooting steps:');
    console.error('   1. Check your .env file exists and contains correct values');
    console.error('   2. Restart your development server (npm run dev)');
    console.error('   3. Verify your Supabase project is active at:', supabaseUrl);
    console.error('   4. Check your network connection');
    
    if (error instanceof Error) {
      console.error('   Error details:', error.message);
      
      // Provide specific guidance based on error type
      if (error.message.includes('Failed to fetch')) {
        console.error('   💡 This usually means:');
        console.error('      - Your Supabase project URL is incorrect');
        console.error('      - Your network is blocking the request');
        console.error('      - Your Supabase project is paused/inactive');
      }
    }
    
    return false;
  }
};

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
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`🔄 Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Safe query wrapper that handles connection issues gracefully
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T | null = null
): Promise<{ data: T | null; error: any; isOffline: boolean }> => {
  try {
    if (connectionStatus === 'disconnected') {
      console.warn('⚠️  Using offline mode - connection previously failed');
      return {
        data: fallbackData,
        error: { message: 'Offline mode - using cached data' },
        isOffline: true
      };
    }

    const result = await queryFn();
    
    if (result.error) {
      console.error('❌ Query failed:', result.error);
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
    console.error('❌ Query exception:', error);
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
    await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('translations')
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
    console.error('❌ Retry query failed:', error);
    connectionStatus = 'disconnected';
    
    return {
      data: fallbackData,
      error: { message: error instanceof Error ? error.message : 'Connection failed' },
      isOffline: true
    };
  }
};

// Database types (keeping existing types)
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

// Test connection on module load
testConnection().catch(() => {
  console.warn('⚠️  Initial connection test failed - check your Supabase configuration');
});