-- 1) Orders: remover acesso amplo, restringir ao dono ou ao fornecedor vinculado
DROP POLICY IF EXISTS "Auth view orders" ON public.orders;

CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.suppliers s
      WHERE s.id = orders.supplier_id AND s.user_id = auth.uid()
    )
  );

-- 2) user_roles: remover INSERT pelo próprio usuário; apenas admins gerenciam
DROP POLICY IF EXISTS "Users insert own role" ON public.user_roles;

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- O trigger handle_new_user() roda como SECURITY DEFINER, então continua
-- atribuindo a role inicial no signup mesmo sem a policy de INSERT pública.