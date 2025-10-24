# Guia de Acesso Administrativo - Fotograf-IA

## Como Acessar a Área Admin

### Opção 1: Pelo Site
1. Acesse a página inicial em `/home`
2. Clique no botão "Admin" no canto superior direito
3. Você será redirecionado para `/admin/login`
4. Digite a senha de administrador

### Opção 2: Acesso Direto
Acesse diretamente a URL: `http://localhost:3000/admin/login`

## Credenciais Padrão

**Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere a senha padrão antes de colocar em produção!

## Como Alterar a Senha

1. Abra o arquivo `app/admin/login/page.tsx`
2. Localize a linha:
   \`\`\`tsx
   const ADMIN_PASSWORD = 'admin123'
   \`\`\`
3. Altere para sua senha desejada:
   \`\`\`tsx
   const ADMIN_PASSWORD = 'sua_senha_segura_aqui'
   \`\`\`

## Fluxo de Trabalho Admin

### 1. Visualizar Submissões
- Acesse `/admin` após fazer login
- Veja todas as submissões dos usuários
- Status disponíveis:
  - 🟠 **Pendente** - Aguardando processamento
  - 🟡 **Processando** - Em andamento
  - 🟢 **Concluído** - Fotos processadas enviadas

### 2. Processar Fotos
Para cada submissão:

1. Clique em "Ver Detalhes"
2. Visualize as fotos originais enviadas pelo usuário
3. Baixe as fotos (clique para abrir em nova aba)
4. Processe as fotos externamente (Photoshop, IA, etc.)
5. Clique em "Marcar como Processando" (opcional)
6. Faça upload das fotos processadas
7. Clique em "Enviar e Concluir"

### 3. Notificar Usuário
Após enviar as fotos processadas:
- O status muda automaticamente para "Concluído"
- O usuário pode visualizar as fotos em `/results?id={submission_id}`

## Recursos da Área Admin

✅ Visualizar todas as submissões
✅ Ver fotos originais enviadas pelos usuários
✅ Fazer upload de fotos processadas
✅ Gerenciar status das submissões
✅ Logout seguro

## Segurança

Para produção, considere implementar:
- Autenticação com Supabase Auth
- Roles de usuário (admin vs user)
- Senhas criptografadas
- Rate limiting
- Logs de auditoria

## Suporte

Se tiver problemas:
1. Verifique se o Supabase está configurado
2. Confirme que os scripts SQL foram executados
3. Verifique as variáveis de ambiente
4. Consulte o README.md principal
