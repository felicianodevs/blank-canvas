-- Limpar todos os dados existentes das tabelas
-- ATENÇÃO: Isso irá deletar TODOS os registros das tabelas

-- Deletar todos os pedidos
DELETE FROM public.orders;

-- Deletar todos os fornecedores
DELETE FROM public.suppliers;

-- Deletar todos os papéis de usuário
DELETE FROM public.user_roles;

-- Deletar todos os perfis
DELETE FROM public.profiles;

-- IMPORTANTE: Os usuários em auth.users precisam ser deletados manualmente
-- através do Dashboard do Supabase em: Authentication > Users
-- Não é possível deletar usuários via migration por questões de segurança