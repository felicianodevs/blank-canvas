-- Fix critical security issues

-- 1. Fix profiles table RLS - Remove public access, allow users to see only their own data
-- and empresa users to see all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Profiles: Empresa users can see all profiles
CREATE POLICY "Empresa can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'empresa'));

-- Profiles: Users can update only their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Profiles: Users can insert only their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 2. Fix user_roles table RLS - Remove ability for users to insert roles freely
-- Only the trigger should be able to create roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- User roles: Users can view only their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- User roles: NO INSERT policy for regular users
-- Only SECURITY DEFINER functions (like handle_new_user trigger) can insert
-- This prevents users from assigning themselves unauthorized roles