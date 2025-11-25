-- Recreate trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint to prevent duplicate roles
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role);

-- Clean up inconsistent data (user without profile/role)
DELETE FROM auth.users 
WHERE id IN (
  SELECT u.id 
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL
);