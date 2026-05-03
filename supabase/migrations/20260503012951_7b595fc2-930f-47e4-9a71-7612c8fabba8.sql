DROP POLICY IF EXISTS "Auth view suppliers" ON public.suppliers;

CREATE POLICY "Users view own suppliers"
ON public.suppliers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.supplier_id = suppliers.id AND o.user_id = auth.uid()
  )
);