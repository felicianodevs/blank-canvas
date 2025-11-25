-- Configurar o bucket purchase_orders como público para permitir visualização de fotos
UPDATE storage.buckets 
SET public = true 
WHERE id = 'purchase_orders';