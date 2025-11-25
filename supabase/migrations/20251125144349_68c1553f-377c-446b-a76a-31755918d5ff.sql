-- Fix RLS policy for user_roles to allow signup
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

-- Create more permissive policy for authenticated users during signup
CREATE POLICY "Allow authenticated users to insert their role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure profiles can be updated during signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Allow authenticated users to manage their profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);