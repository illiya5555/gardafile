import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  message: string;
  sender_type: 'user' | 'bot';
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