-- Make orders table more flexible by removing NOT NULL constraints
-- Only keep essential fields as required: id, customer_name, status, total_amount

-- Make customer_email optional
ALTER TABLE orders ALTER COLUMN customer_email DROP NOT NULL;

-- Make customer_phone optional (if it's currently required)
ALTER TABLE orders ALTER COLUMN customer_phone DROP NOT NULL;

-- Make pickup_time optional (if it's currently required) 
ALTER TABLE orders ALTER COLUMN pickup_time DROP NOT NULL;

-- Make special_instructions optional (should already be optional)
ALTER TABLE orders ALTER COLUMN special_instructions DROP NOT NULL;

-- Make stripe_session_id optional (in case we want to support non-Stripe orders)
ALTER TABLE orders ALTER COLUMN stripe_session_id DROP NOT NULL;

-- Verify the changes by checking column info
SELECT column_name, is_nullable, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;