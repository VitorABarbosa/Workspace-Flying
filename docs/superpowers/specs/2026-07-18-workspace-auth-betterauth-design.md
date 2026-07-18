# Workspace Auth — Migração Supabase Auth → Better Auth no Neon (Design)

**Data:** 2026-07-18
**Projeto:** `flyingstudio-tools` (Next.js 14 App Router)
**Status:** Aprovado para planejamento

## 1. Objetivo

Substituir a autenticação/autorização do Workspace, hoje apoiada no **Supabase Auth do projeto PESQUISADOR**, por um sistema **próprio** usando **Better Auth** com banco **Neon** dedicado. Isso desacopla o Workspace do PESQUISADOR (permitindo migrar o PESQUISADOR depois de forma independente) e dá ao Workspace controle total sobre usuários, roles e permissões.

**Escopo desta entrega:** apenas autenticação/autorização. Storage de assets (bucket Supabase `flyingstudio`) e a integração HTTP com a LUMEN permanecem inalterados.

## 2. Decisões (fechadas com o usuário)

1. **Contas individuais apenas.** Remove a conta de equipe compartilhada (`team@flyingstudio.com.br`) e o toggle de "senha da equipe" no login.
2. **Recriar usuários do zero.** Não há migração de dados/senhas do Supabase. Um script de bootstrap cria o primeiro admin; o resto é cadastrado pelo painel.
3. **Admin gerencia senhas (sem email).** Sem provedor de email, sem verificação de email, sem reset self-service. Admin define e redefine senhas pelo painel. Cadastro público desabilitado.
4. **Adapter de banco: `pg.Pool` direto** (sem ORM). Better Auth gerencia suas tabelas; `tool_permissions` é gerida com queries `pg`.
5. **Storage permanece no Supabase** por ora (item separado, futuro).

## 3. Arquitetura

- **Novo projeto Neon dedicado** (`flyingstudio-auth`), separado do projeto Neon da LUMEN. Connection string fornecida pelo usuário como `DATABASE_URL`.
- **`src/lib/auth.ts`** — instância servidor do Better Auth:
  - `database: new Pool({ connectionString: process.env.DATABASE_URL })` (endpoint pooled do Neon → `statement_cache_size` não se aplica ao driver `pg`; usar o pooled é seguro).
  - `emailAndPassword: { enabled: true, disableSignUp: true }` (só admin cria usuários).
  - `plugins: [admin({ defaultRole: 'member', adminRoles: ['admin'] }), nextCookies()]`.
  - `secret: process.env.BETTER_AUTH_SECRET`, `baseURL: process.env.BETTER_AUTH_URL`.
- **`src/lib/auth-client.ts`** — `createAuthClient()` (+ `adminClient()` plugin) para o form de login e chamadas client.
- **`src/app/api/auth/[...all]/route.ts`** — `toNextJsHandler(auth)` expõe os endpoints do Better Auth.
- **`src/lib/permissions.ts`** — módulo com um `pg.Pool` (reutilizando o mesmo pool do Better Auth quando possível) e funções tipadas para `tool_permissions` (listar do usuário, listar todas, substituir set de um usuário).
- **Segurança:** o browser deixa de acessar o banco diretamente (o modelo atual expõe a anon key no browser e depende de RLS). Todo acesso ao Postgres passa a ser server-side via pool. RLS deixa de ser necessária.

## 4. Modelo de dados (Neon)

Tabelas geridas pelo Better Auth (criadas via `npx @better-auth/cli migrate`):
- **`user`** — `id` (text), `name`, `email`, `emailVerified` (bool), `image`, `createdAt`, `updatedAt`, e do plugin admin: `role` (string), `banned` (bool), `banReason` (string), `banExpires` (date).
- **`session`** — `id`, `userId`, `token`, `expiresAt`, `ipAddress`, `userAgent`, `createdAt`, `updatedAt`.
- **`account`** — credenciais (hash de senha do email/senha), `providerId`, `accountId`, `userId`, etc.
- **`verification`** — tokens (não usado ativamente sem email, mas criado pelo schema).

Tabela própria (migração SQL manual):
```sql
create table if not exists tool_permissions (
  user_id    text not null references "user"(id) on delete cascade,
  tool_slug  text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_slug)
);
create index if not exists tool_permissions_user_id_idx on tool_permissions (user_id);
```
Sem RLS (acesso só server-side). `user_id` é `text` para casar com o `id` do Better Auth.

**Role:** `admin` | `member`. Default `member`. `adminRoles: ['admin']`. Substitui `app_metadata.role`.
**Desativação:** campos `banned`/`banExpires` do plugin admin substituem `banned_until`.

## 5. Sessão e Middleware

- **`src/middleware.ts`**: verificação **otimista** de presença de sessão via `getSessionCookie(request)` (de `better-auth/cookies`) — sem hit no banco (compatível com edge). Se não houver cookie de sessão → `redirect('/login')`. Mesmo `matcher` atual: `['/tools/:path*', '/api/tools/:path*', '/api/agents/:path*', '/admin/:path*']`.
- **Guard de `/admin` movido para server component** `src/app/admin/layout.tsx`: chama `auth.api.getSession({ headers: await headers() })` e, se `session.user.role !== 'admin'`, `redirect('/tools')`. (Padrão recomendado pelo Better Auth; o middleware edge não roda `pg`.)
- Leitura de sessão no server em qualquer lugar: `const session = await auth.api.getSession({ headers: await headers() })` → `session?.user` (com `.id`, `.email`, `.name`, `.role`).

## 6. Fluxo de login

- **`src/app/login/LoginForm.tsx`** (client): só email + senha (remove o toggle/`TEAM_EMAIL`). Usa `authClient.signIn.email({ email, password })`. Em erro, exibe mensagem; em sucesso, `router.push('/')` / refresh.
- **`src/app/login/page.tsx`** (server): se `auth.api.getSession(...)` já tem sessão → `redirect('/')`.
- **`src/app/actions/auth.ts`**: `logout()` → `auth.api.signOut({ headers: await headers() })` + `redirect('/login')`.

## 7. Admin CRUD (server actions)

`src/app/admin/actions.ts` — todas `'use server'`, cada uma chama `requireAdmin()` primeiro.

`requireAdmin()`: `const session = await auth.api.getSession({ headers: await headers() })`; se `!session || session.user.role !== 'admin'` → `throw new Error('Unauthorized')`. (Lê a sessão do servidor; para checar role "fresca" sem confiar só no cookie, opcionalmente `auth.api.getSession` já bate no DB de sessão.)

| Action | Assinatura | Implementação Better Auth |
|---|---|---|
| `createMember` | `(name, email, password, role, tools[])` | `auth.api.createUser({ body: { name, email, password, role } })` → pega `user.id` → insere linhas em `tool_permissions` |
| `updatePermissions` | `(userId, tools[], role)` | `auth.api.setRole({ body: { userId, role }, headers })` + substitui set em `tool_permissions` (delete-all + insert) |
| `disableMember` | `(userId)` | `auth.api.banUser({ body: { userId }, headers })` |
| `reactivateMember` | `(userId)` | `auth.api.unbanUser({ body: { userId }, headers })` |
| `deleteMember` | `(userId)` | `auth.api.removeUser({ body: { userId }, headers })` (cascade apaga `tool_permissions`) |
| `resetPassword` (novo) | `(userId, newPassword)` | `auth.api.setUserPassword({ body: { userId, newPassword }, headers })` |

`src/app/admin/page.tsx`: lista membros via `auth.api.listUsers({ query: { limit: 100 }, headers })` + `getAllToolPermissions()` de `permissions.ts`, faz o join em JS montando o tipo `Member` (mesmos campos: id, email, name, role, tools[], desativado a partir de `banned`).

## 8. Enforcement de permissão por ferramenta

`src/app/tools/[slug]/page.tsx` (server component): mantém a lógica; troca a query Supabase por `getUserToolPermission(userId, tool.id)` de `permissions.ts` (SELECT em `tool_permissions`). Sem permissão → renderiza `<LockedToolShell />` (bloqueio visual, sem redirect). Tools com `requiresAuth` falsy pulam a checagem (comportamento atual preservado; hoje só `lumen` exige).

## 9. Bootstrap do primeiro admin

`scripts/bootstrap-admin.ts` (rodado uma vez, fora do fluxo web): usa `auth.api.createUser` para criar o primeiro usuário com `role: 'admin'`, email/senha definidos por variáveis de ambiente ou args. Documentado no README. Depois, esse admin cadastra os demais pelo painel.

## 10. Variáveis de ambiente

Adicionar:
- `DATABASE_URL` — connection string do Neon dedicado do Workspace.
- `BETTER_AUTH_SECRET` — segredo (gerar aleatório).
- `BETTER_AUTH_URL` — URL base da app (ex.: `http://localhost:3000` em dev; URL de produção no deploy).

Manter (Storage): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (usados só por `src/lib/supabase.ts` → `getAssetUrl`).
Remover: `SUPABASE_SERVICE_ROLE_KEY` (só era usado pelo `supabase-admin.ts`).
Não-auth, mantidos: `NEXT_PUBLIC_LUMEN_URL`, `NEXT_PUBLIC_PESQUISADOR_URL`.

## 11. Arquivos (criar / modificar / remover)

**Criar:**
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/permissions.ts`
- `src/app/api/auth/[...all]/route.ts`
- `src/app/admin/layout.tsx` (guard de admin)
- `scripts/bootstrap-admin.ts`
- migração SQL da `tool_permissions` (ex.: `db/tool_permissions.sql`)

**Modificar:**
- `src/middleware.ts`, `src/app/login/LoginForm.tsx`, `src/app/login/page.tsx`, `src/app/actions/auth.ts`, `src/app/admin/actions.ts`, `src/app/admin/page.tsx`, `src/app/tools/[slug]/page.tsx`
- `src/components/admin/CreateMemberForm.tsx` (sem mudança de contrato; confirmar campos), `src/components/admin/MemberRow.tsx` (+ "redefinir senha"), `src/components/admin/EditPermissionsForm.tsx` (assinatura de `updatePermissions` sem `currentAppMetadata`)
- `package.json` (+`better-auth`, +`pg`, +`@types/pg`; −`@supabase/ssr`), `.env.local.example`, `.env.example`

**Remover:**
- `src/lib/supabase-server.ts`, `src/lib/supabase-admin.ts`

**Mantido inalterado:**
- `src/lib/supabase.ts` (Storage), `src/config/tools.ts`, `src/components/tools/LockedToolShell.tsx`, integração LUMEN (`src/app/api/tools/lumen/...`).

## 12. Estratégia de testes

A app tem ampla suíte Jest que mocka o Supabase (login, admin actions, middleware, member components). Impacto:
- **Reescrever** os mocks de `@supabase/ssr`/`@supabase/supabase-js` para mockar `src/lib/auth.ts` (`auth.api.*`) e `src/lib/permissions.ts`. Arquivos: `src/__tests__/LoginPage.test.tsx`, `LogoutAction.test.ts`, `middleware.test.ts`, `adminActions.test.ts`, `lib/supabase.test.ts` (revisar — se for só Storage, mantém), e `src/components/admin/__tests__/*`.
- **Novos testes:** `permissions.ts` (unit), `requireAdmin()` (nega não-admin), enforcement de tool (LockedToolShell quando sem permissão), createMember cria user + permissões.
- Cada task do plano segue TDD; os testes de integração que exigem DB usam o Neon dedicado (ou um schema de teste).

## 13. Fora de escopo (explícito)

- **Storage** (bucket `flyingstudio`) — permanece no Supabase; migração futura.
- **Migração do PESQUISADOR** — projeto separado, depois.
- **Integração LUMEN** — inalterada (HTTP; já migrada para Neon do lado do backend).
- **Verificação de email / reset self-service / OAuth** — não incluídos.

## 14. Rollout

1. Criar projeto Neon `flyingstudio-auth`, obter `DATABASE_URL`.
2. Instalar deps, configurar `auth.ts`, rodar `@better-auth/cli migrate` (cria tabelas Better Auth) + aplicar `tool_permissions.sql`.
3. Implementar as camadas (login, middleware, admin, permissões) com testes.
4. Rodar `scripts/bootstrap-admin.ts` para criar o primeiro admin.
5. Validar e2e local (login, guard de admin, criar membro, gating de tool).
6. Deploy: setar `DATABASE_URL`/`BETTER_AUTH_SECRET`/`BETTER_AUTH_URL`; remover `SUPABASE_SERVICE_ROLE_KEY`.
7. Recadastrar os membros reais pelo painel.
