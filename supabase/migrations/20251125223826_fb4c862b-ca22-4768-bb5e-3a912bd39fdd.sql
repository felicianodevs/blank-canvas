-- Add photo fields to orders table
ALTER TABLE public.orders 
ADD COLUMN photo_url text,
ADD COLUMN photo_name text;