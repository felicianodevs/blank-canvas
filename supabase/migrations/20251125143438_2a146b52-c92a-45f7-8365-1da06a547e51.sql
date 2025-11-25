-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('empresa', 'fornecedor');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (CRITICAL: separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id),
  file_url TEXT,
  file_name TEXT,
  value DECIMAL(12,2),
  status TEXT DEFAULT 'pendente',
  delivery_status TEXT DEFAULT 'pendente',
  observation TEXT,
  order_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Empresa users can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'empresa'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for suppliers
CREATE POLICY "Empresa users can view all suppliers"
  ON public.suppliers FOR SELECT
  USING (public.has_role(auth.uid(), 'empresa'));

CREATE POLICY "Fornecedor users can view their own supplier record"
  ON public.suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplier record"
  ON public.suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Empresa users can insert suppliers"
  ON public.suppliers FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'empresa'));

-- RLS Policies for orders
CREATE POLICY "Empresa users can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'empresa'));

CREATE POLICY "Fornecedor users can view their own orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = orders.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Empresa users can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'empresa'));

CREATE POLICY "Fornecedor users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = orders.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Empresa users can update all orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'empresa'));

CREATE POLICY "Fornecedor users can update their own orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = orders.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

-- Create trigger function for new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, empresa, cnpj)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'empresa', ''),
    COALESCE(NEW.raw_user_meta_data->>'cnpj', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for purchase orders
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase_orders', 'purchase_orders', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for purchase_orders bucket
CREATE POLICY "Empresa users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'purchase_orders' AND
    public.has_role(auth.uid(), 'empresa')
  );

CREATE POLICY "Fornecedor users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'purchase_orders' AND
    public.has_role(auth.uid(), 'fornecedor')
  );

CREATE POLICY "Authenticated users can view files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'purchase_orders' AND auth.role() = 'authenticated');