# Guia de Configuração - Supabase Auth

Para que o login funcione corretamente em produção (`https://xzenpress.com`), você precisa habilitar os provedores e configurar os redirecionamentos no painel do Supabase.

## 1. Acessar o Painel
Acesse seu projeto no Supabase: [https://supabase.com/dashboard/project/dqjcbwjqrenubdzalicy](https://supabase.com/dashboard/project/dqjcbwjqrenubdzalicy)

## 2. Configurar URL do Site (Site URL)
1. No menu lateral, vá em **Authentication** -> **URL Configuration**.
2. Em **Site URL**, coloque:
   ```
   https://xzenpress.com
   ```
3. Em **Redirect URLs**, adicione:
   ```
   https://xzenpress.com
   https://xzenpress.com/auth/callback
   http://localhost:5173 (para testes locais)
   ```
4. Clique em **Save**.

## 3. Habilitar Login com Google
1. No menu lateral, vá em **Authentication** -> **Providers**.
2. Clique em **Google**.
3. Ative a opção **Enable Sign in with Google**.
4. Você precisará do **Client ID** e **Client Secret** do Google Cloud Console.
   * *Se você já tem esses dados configurados, apenas verifique se a "Authorized redirect URI" no Google Cloud é:*
     `https://dqjcbwjqrenubdzalicy.supabase.co/auth/v1/callback`
5. Clique em **Save**.

## 4. Habilitar Login com Email (Já deve estar ativo)
1. Em **Authentication** -> **Providers**, verifique se **Email** está habilitado.
2. Certifique-se de que "Confirm email" está desativado se você quiser permitir login imediato sem verificação de email (opcional, mas recomendado para testes rápidos).

---
**Pronto!** Após essas configurações, o login no site `https://xzenpress.com` funcionará automaticamente.
