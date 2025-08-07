-- ====================================
-- PITA MELT RESTAURANT - SUPABASE SCHEMA
-- ====================================
-- Run this SQL in your Supabase SQL Editor to create the orders table

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'preparing', 'ready', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'succeeded' CHECK (payment_status IN ('succeeded', 'failed', 'pending')),
  items JSONB NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on created_at for faster ordering
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Create an index on status for admin filtering
CREATE INDEX idx_orders_status ON orders(status);

-- Create an index on stripe_session_id for webhook lookups
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is admin-only)
-- In production, you might want more restrictive policies
CREATE POLICY "Allow all operations on orders" ON orders
FOR ALL USING (true);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();