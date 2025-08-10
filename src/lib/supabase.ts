import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for public operations (admin dashboard)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  pickup_time: string;
  total_amount: number;
  status: "confirmed" | "preparing" | "ready" | "completed";
  payment_status: "succeeded" | "failed" | "pending";
  items: OrderItem[];
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}
