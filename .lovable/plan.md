
## Acesso livre para testes (bypass de login)

Vou desabilitar temporariamente a exigência de login para você poder navegar pelo sistema e testar todas as telas.

### O que será alterado

1. **Rota inicial (`/`)** — em vez de abrir a tela de Login, vai redirecionar direto para `/dashboard`.

2. **Menu de navegação de teste** — adicionar uma barra simples no topo das páginas internas com links rápidos para:
   - Dashboard (Empresa)
   - Supplier Dashboard (Fornecedor)
   - Orders
   - Monthly History
   - Supplier Details
   - Login (caso queira testar o fluxo de login depois)

3. **Remover bloqueios de autenticação** — qualquer página que hoje redirecione para `/` quando não há usuário logado vai passar a renderizar normalmente em modo "convidado".

4. **Aviso visual** — um banner amarelo discreto no topo: *"Modo de teste — autenticação desabilitada"*, para lembrar que está em modo dev.

### O que NÃO será alterado

- As páginas de Login e Cadastro continuam funcionando normalmente (acessíveis via `/` e `/register` pelo banner).
- Nenhuma tabela do Supabase é modificada.
- A lógica de roles (empresa/fornecedor) fica intacta — só não é exigida.

### Como reverter depois
Quando quiser reativar o login, é só pedir "reativar autenticação" e eu volto o comportamento original em uma única alteração.
