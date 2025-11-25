-- Atualizar a função handle_new_user para criar user_roles e suppliers automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_type text;
BEGIN
  -- Get userType from metadata, default to 'empresa'
  user_type := COALESCE(NEW.raw_user_meta_data->>'userType', 'empresa');
  
  -- Insert into profiles with ALL fields
  INSERT INTO public.profiles (id, nome, email, empresa, cnpj, telefone, endereco, cidade, estado)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'empresa', ''),
    COALESCE(NEW.raw_user_meta_data->>'cnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'endereco', ''),
    COALESCE(NEW.raw_user_meta_data->>'cidade', ''),
    COALESCE(NEW.raw_user_meta_data->>'estado', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = COALESCE(NULLIF(EXCLUDED.nome, ''), public.profiles.nome),
    empresa = COALESCE(NULLIF(EXCLUDED.empresa, ''), public.profiles.empresa),
    cnpj = COALESCE(NULLIF(EXCLUDED.cnpj, ''), public.profiles.cnpj),
    telefone = COALESCE(NULLIF(EXCLUDED.telefone, ''), public.profiles.telefone),
    endereco = COALESCE(NULLIF(EXCLUDED.endereco, ''), public.profiles.endereco),
    cidade = COALESCE(NULLIF(EXCLUDED.cidade, ''), public.profiles.cidade),
    estado = COALESCE(NULLIF(EXCLUDED.estado, ''), public.profiles.estado);
  
  -- Create user role (empresa or fornecedor)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_type::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- If fornecedor, create supplier record
  IF user_type = 'fornecedor' THEN
    INSERT INTO public.suppliers (user_id, name, cnpj)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'empresa', ''),
      COALESCE(NEW.raw_user_meta_data->>'cnpj', '')
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Limpar dados inconsistentes das tabelas públicas
DELETE FROM public.orders;
DELETE FROM public.suppliers;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;