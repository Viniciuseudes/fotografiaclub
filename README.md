# Fotograf-IA - MVP Manual

Sistema de geração de fotos profissionais com IA para profissionais de saúde.

## 🚀 Como Rodar o Projeto

### Opção 1: Usando shadcn CLI (Recomendado)
\`\`\`bash
npx shadcn@latest init fotografia-app
cd fotografia-app
npm run dev
\`\`\`

### Opção 2: Download ZIP
1. Clique nos três pontos no canto superior direito
2. Selecione "Download ZIP"
3. Extraia e rode:
\`\`\`bash
npm install
npm run dev
\`\`\`

O app estará disponível em `http://localhost:3000`

## 📋 Configuração do Banco de Dados

### 1. Configurar Supabase

As variáveis de ambiente já estão configuradas no v0. Agora você precisa:

1. **Rodar os scripts SQL** (na ordem):
   - `scripts/01-create-tables.sql` - Cria as tabelas
   - `scripts/02-create-storage-bucket.sql` - Cria o bucket de storage

2. **Como rodar os scripts**:
   - No v0: Os scripts podem ser executados diretamente
   - No Supabase Dashboard: SQL Editor → Cole o conteúdo → Run

### 2. Estrutura do Banco

**Tabela `submissions`:**
- `id` - UUID (chave primária)
- `user_name` - Nome do usuário
- `user_email` - Email do usuário
- `specialty` - Especialidade (médico, dentista, etc)
- `phone` - Telefone (opcional)
- `status` - Status: 'pending', 'processing', 'completed'
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**Tabela `photos`:**
- `id` - UUID (chave primária)
- `submission_id` - Referência para submissions
- `photo_type` - Tipo: 'original' ou 'processed'
- `photo_url` - URL da foto no storage
- `created_at` - Data de criação

## 🔄 Fluxo de Trabalho Manual

### Para Usuários:
1. Acessa `/home` e clica em "Começar Agora"
2. Preenche formulário com dados pessoais
3. Faz upload de 5+ fotos
4. Confirma e envia
5. É redirecionado para `/results?id={submission_id}`
6. Vê status "Processando" até admin processar

### Para Admin:
1. Acessa `/admin`
2. Vê lista de todas as submissões
3. Clica em "Ver Detalhes" na submissão
4. Visualiza fotos originais enviadas pelo usuário
5. Baixa as fotos originais
6. Processa manualmente (edita, usa IA externa, etc)
7. Faz upload das fotos processadas
8. Clica em "Enviar e Concluir"
9. Status muda para "completed"
10. Usuário pode ver as fotos em `/results`

## 📁 Estrutura de Arquivos

\`\`\`
app/
├── page.tsx              # Login (Google/Apple)
├── home/page.tsx         # Landing page
├── form/page.tsx         # Formulário multi-etapas
├── results/page.tsx      # Resultados com paywall
├── admin/page.tsx        # Painel administrativo
└── api/
    └── submissions/
        ├── route.ts      # GET/POST submissions
        └── [id]/route.ts # GET/PATCH submission específica

lib/
└── supabase/
    ├── client.ts         # Cliente browser
    └── server.ts         # Cliente server

scripts/
├── 01-create-tables.sql  # Cria tabelas
└── 02-create-storage-bucket.sql # Cria storage
\`\`\`

## 🎨 Páginas Disponíveis

- `/` - Login com Google/Apple
- `/home` - Landing page com hero
- `/form` - Formulário de upload
- `/results?id={id}` - Resultados do usuário
- `/admin` - Painel administrativo

## 🔐 Segurança

- Row Level Security (RLS) habilitado
- Políticas permissivas para MVP (ajuste depois)
- Storage público para facilitar acesso
- Sem autenticação real no MVP (adicione depois)

## 📝 Próximos Passos (Pós-MVP)

1. **Autenticação real** - Implementar Supabase Auth
2. **Pagamentos** - Integrar Stripe
3. **Email** - Notificações quando fotos estiverem prontas
4. **IA Automática** - Integrar API de geração de imagens
5. **Segurança** - Restringir políticas RLS por usuário

## 🆘 Troubleshooting

**Erro ao fazer upload:**
- Verifique se o bucket 'photos' foi criado
- Verifique as políticas de storage

**Submissões não aparecem:**
- Rode o script `01-create-tables.sql`
- Verifique as variáveis de ambiente

**Fotos não carregam:**
- Verifique se o bucket é público
- Rode o script `02-create-storage-bucket.sql`
