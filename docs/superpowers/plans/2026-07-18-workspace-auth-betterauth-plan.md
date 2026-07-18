# Workspace Auth (Better Auth + Neon) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o Supabase Auth do Workspace (`flyingstudio-tools`) por Better Auth com banco Neon dedicado, preservando o modelo de membros/roles/permissões-por-ferramenta, sem migrar dados (usuários recriados do zero).

**Architecture:** Better Auth (server em `src/lib/auth.ts`) sobre um `pg.Pool` apontando para um projeto Neon dedicado. O plugin `admin` fornece role/ban/CRUD de usuários; a tabela própria `tool_permissions` guarda o acesso por ferramenta (queries `pg` em `src/lib/permissions.ts`). Middleware faz redirect otimista por cookie; guards de role ficam em server components/actions. Storage (bucket Supabase) e integração LUMEN permanecem inalterados.

**Tech Stack:** Next.js 14 (App Router), TypeScript, better-auth, pg (node-postgres), Neon Postgres, Jest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-07-18-workspace-auth-betterauth-design.md`

## Global Constraints

- **Só contas individuais.** Sem conta de equipe compartilhada; remover `TEAM_EMAIL` e o toggle do login.
- **Cadastro público desabilitado:** `emailAndPassword: { enabled: true, disableSignUp: true }`. Só admin cria usuários.
- **Sem email:** sem verificação de email, sem reset self-service. Admin define/redefine senha.
- **Roles:** `admin` | `member`; `defaultRole: 'member'`; `adminRoles: ['admin']`.
- **`tool_permissions.user_id` é `text`** (casa com `user.id` do Better Auth) com FK `references "user"(id) on delete cascade`.
- **`nextCookies()` deve ser o ÚLTIMO plugin** no array de plugins.
- **Nenhum acesso ao banco no browser.** Todo Postgres é server-side via pool. Sem RLS.
- **Não tocar:** `src/lib/supabase.ts` (Storage), `src/config/tools.ts` (registry), `src/components/tools/LockedToolShell.tsx`, integração LUMEN (`src/app/api/tools/lumen/**`).
- Comandos shell assumem Git Bash (POSIX) no Windows. Trabalhar em um branch `feat/betterauth-migration` (não em master).

---

### Task 1: Setup — deps, Better Auth core, tabelas no Neon

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Create: `db/tool_permissions.sql`
- Modify: `package.json`, `.env.local.example`, `.env.example`

**Interfaces:**
- Produces: `auth` (instância Better Auth) exportada de `src/lib/auth.ts`, com `auth.api.*` (getSession, createUser, setRole, banUser, unbanUser, removeUser, setUserPassword, listUsers) e `auth.handler`. Consumido por todas as tasks seguintes.

- [ ] **Step 1: Instalar dependências**

Run:
```bash
npm install better-auth pg
npm install -D @types/pg
npm uninstall @supabase/ssr
```
Expected: `better-auth` e `pg` em `dependencies`; `@supabase/ssr` removido. `@supabase/supabase-js` PERMANECE (Storage).

- [ ] **Step 2: Criar `src/lib/auth.ts`**

```ts
import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { Pool } from 'pg'

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // só admin cria usuários
  },
  plugins: [
    admin({ defaultRole: 'member', adminRoles: ['admin'] }),
    nextCookies(), // DEVE ser o último plugin
  ],
})
```

- [ ] **Step 3: Criar o route handler `src/app/api/auth/[...all]/route.ts`**

```ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

- [ ] **Step 4: Configurar env vars**

Criar `.env.local` (não versionado) com:
```
DATABASE_URL=<connection string do Neon dedicado do Workspace>
BETTER_AUTH_SECRET=<gerar: `openssl rand -base64 32`>
BETTER_AUTH_URL=http://localhost:3000
```
Atualizar `.env.local.example` e `.env.example` adicionando `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`; remover `SUPABASE_SERVICE_ROLE_KEY`; manter `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` (Storage) e `NEXT_PUBLIC_LUMEN_URL`/`NEXT_PUBLIC_PESQUISADOR_URL`.

- [ ] **Step 5: Gerar as tabelas do Better Auth no Neon**

Run: `npx @better-auth/cli migrate` (lê `src/lib/auth.ts`, cria `user`, `session`, `account`, `verification` com os campos do plugin admin).
Expected: tabelas criadas no Neon sem erro. Confirmar: `psql "$DATABASE_URL" -c "\dt"` (ou script node) lista as 4 tabelas.

- [ ] **Step 6: Criar e aplicar `db/tool_permissions.sql`**

```sql
create table if not exists tool_permissions (
  user_id    text not null references "user"(id) on delete cascade,
  tool_slug  text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_slug)
);
create index if not exists tool_permissions_user_id_idx on tool_permissions (user_id);
```
Aplicar via node (`pool.query(fs.readFileSync(...))`) ou `psql "$DATABASE_URL" -f db/tool_permissions.sql`.
Expected: tabela `tool_permissions` criada.

- [ ] **Step 7: Commit**
```bash
git add src/lib/auth.ts "src/app/api/auth/[...all]/route.ts" db/tool_permissions.sql package.json package-lock.json .env.local.example .env.example
git commit -m "feat(auth): Better Auth core + tabelas Neon + tool_permissions"
```

---

### Task 2: Módulo `permissions.ts` (queries de tool_permissions)

**Files:**
- Create: `src/lib/permissions.ts`
- Test: `src/__tests__/lib/permissions.test.ts`

**Interfaces:**
- Consumes: `pool` de `src/lib/auth.ts`.
- Produces:
  - `getUserTools(userId: string): Promise<string[]>` — slugs do usuário.
  - `hasToolPermission(userId: string, toolSlug: string): Promise<boolean>`.
  - `getAllToolPermissions(): Promise<{ userId: string; toolSlug: string }[]>` — todas (para o join do admin).
  - `setUserTools(userId: string, toolSlugs: string[]): Promise<void>` — substitui o set inteiro (delete-all + insert numa transação).

- [ ] **Step 1: Escrever os testes (falhando)**

```ts
import { getUserTools, hasToolPermission, setUserTools, getAllToolPermissions } from '@/lib/permissions'
import { auth, pool } from '@/lib/auth'

// helper: cria um user de teste via auth.api.createUser e devolve o id; limpa no fim.
async function makeUser(email: string): Promise<string> {
  const res = await auth.api.createUser({ body: { email, password: 'test-pass-123', name: 'T' } })
  return res.user.id
}

let userId: string
beforeAll(async () => { userId = await makeUser(`perm-${Date.now()}@test.com`) })
afterAll(async () => { await pool.query('delete from "user" where id = $1', [userId]); await pool.end() })

test('setUserTools replaces the whole set', async () => {
  await setUserTools(userId, ['lumen', 'pesquisador'])
  expect((await getUserTools(userId)).sort()).toEqual(['lumen', 'pesquisador'])
  await setUserTools(userId, ['lumen'])
  expect(await getUserTools(userId)).toEqual(['lumen'])
})

test('hasToolPermission reflects the set', async () => {
  await setUserTools(userId, ['lumen'])
  expect(await hasToolPermission(userId, 'lumen')).toBe(true)
  expect(await hasToolPermission(userId, 'pesquisador')).toBe(false)
})

test('getAllToolPermissions includes the user rows', async () => {
  await setUserTools(userId, ['lumen'])
  const all = await getAllToolPermissions()
  expect(all).toEqual(expect.arrayContaining([{ userId, toolSlug: 'lumen' }]))
})
```

- [ ] **Step 2: Rodar — deve FALHAR** (`DATABASE_URL` do Neon exportada)

Run: `DATABASE_URL="<neon>" npx jest src/__tests__/lib/permissions.test.ts`
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Implementar `src/lib/permissions.ts`**

```ts
import 'server-only'
import { pool } from '@/lib/auth'

export async function getUserTools(userId: string): Promise<string[]> {
  const { rows } = await pool.query(
    'select tool_slug from tool_permissions where user_id = $1',
    [userId],
  )
  return rows.map((r) => r.tool_slug as string)
}

export async function hasToolPermission(userId: string, toolSlug: string): Promise<boolean> {
  const { rows } = await pool.query(
    'select 1 from tool_permissions where user_id = $1 and tool_slug = $2 limit 1',
    [userId, toolSlug],
  )
  return rows.length > 0
}

export async function getAllToolPermissions(): Promise<{ userId: string; toolSlug: string }[]> {
  const { rows } = await pool.query('select user_id, tool_slug from tool_permissions')
  return rows.map((r) => ({ userId: r.user_id as string, toolSlug: r.tool_slug as string }))
}

export async function setUserTools(userId: string, toolSlugs: string[]): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query('delete from tool_permissions where user_id = $1', [userId])
    for (const slug of toolSlugs) {
      await client.query(
        'insert into tool_permissions (user_id, tool_slug) values ($1, $2) on conflict do nothing',
        [userId, slug],
      )
    }
    await client.query('commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }
}
```

- [ ] **Step 4: Rodar — deve PASSAR**

Run: `DATABASE_URL="<neon>" npx jest src/__tests__/lib/permissions.test.ts`
Expected: PASS (3).

- [ ] **Step 5: Commit**
```bash
git add src/lib/permissions.ts src/__tests__/lib/permissions.test.ts
git commit -m "feat(auth): módulo permissions.ts (tool_permissions via pg)"
```

---

### Task 3: Cliente de auth + fluxo de login/logout

**Files:**
- Create: `src/lib/auth-client.ts`
- Modify: `src/app/login/LoginForm.tsx`, `src/app/login/page.tsx`, `src/app/actions/auth.ts`
- Test: `src/__tests__/LoginPage.test.tsx`, `src/__tests__/LogoutAction.test.ts` (atualizar)

**Interfaces:**
- Produces: `authClient` (de `src/lib/auth-client.ts`) com `.signIn.email`, `.signOut`, e ações do `adminClient` no client se necessário.
- Consumes: `auth` de `src/lib/auth.ts`.

- [ ] **Step 1: Criar `src/lib/auth-client.ts`**

```ts
import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL, // ou undefined → same-origin
  plugins: [adminClient()],
})
```
(Adicionar `NEXT_PUBLIC_APP_URL` aos envs se quiser explicitar; same-origin funciona sem ela.)

- [ ] **Step 2: Atualizar os testes de login/logout (falhando)**

Ler `src/__tests__/LoginPage.test.tsx` e `LogoutAction.test.ts` atuais; substituir os mocks de `@supabase/ssr`/`createBrowserClient` por mocks de `@/lib/auth-client` (`authClient.signIn.email`) e `@/lib/auth` (`auth.api.getSession`, `auth.api.signOut`). Asserts:
- login com credenciais válidas chama `authClient.signIn.email({ email, password })` e navega;
- login inválido exibe erro;
- `logout()` chama `auth.api.signOut` e redireciona para `/login`.

- [ ] **Step 3: Rodar — deve FALHAR**

Run: `npx jest src/__tests__/LoginPage.test.tsx src/__tests__/LogoutAction.test.ts`
Expected: FAIL.

- [ ] **Step 4: Reescrever `LoginForm.tsx` (só individual)**

Ler o arquivo atual. Remover `TEAM_EMAIL`, o estado `showIndividualLogin` e o toggle. Form final: campos `email` + `password`. Submit:
```ts
const { error } = await authClient.signIn.email({ email, password })
if (error) { setError('Email ou senha inválidos'); return }
router.push('/')
router.refresh()
```
Preservar o layout/estilo existente (mesmas classes/estrutura visual), mudando apenas a lógica e removendo o campo/toggle da conta de equipe.

- [ ] **Step 5: Atualizar `login/page.tsx` e `actions/auth.ts`**

`login/page.tsx` (server): 
```ts
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
// ...
const session = await auth.api.getSession({ headers: await headers() })
if (session) redirect('/')
```
`actions/auth.ts`:
```ts
'use server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  await auth.api.signOut({ headers: await headers() })
  redirect('/login')
}
```

- [ ] **Step 6: Rodar — deve PASSAR**

Run: `npx jest src/__tests__/LoginPage.test.tsx src/__tests__/LogoutAction.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**
```bash
git add src/lib/auth-client.ts src/app/login/LoginForm.tsx src/app/login/page.tsx src/app/actions/auth.ts src/__tests__/LoginPage.test.tsx src/__tests__/LogoutAction.test.ts
git commit -m "feat(auth): login/logout via Better Auth (contas individuais)"
```

---

### Task 4: Middleware + guard de admin

**Files:**
- Modify: `src/middleware.ts`
- Create: `src/app/admin/layout.tsx`
- Test: `src/__tests__/middleware.test.ts` (atualizar)

**Interfaces:**
- Consumes: `getSessionCookie` de `better-auth/cookies`; `auth.api.getSession`.

- [ ] **Step 1: Atualizar `middleware.test.ts` (falhando)**

Ler o teste atual. Mockar `better-auth/cookies` (`getSessionCookie`). Asserts: sem cookie de sessão → redirect para `/login` nas rotas do matcher; com cookie → `NextResponse.next()`. (O guard de role de admin sai do middleware — remover asserts de role daqui; passam para o teste do layout.)

- [ ] **Step 2: Rodar — deve FALHAR**

Run: `npx jest src/__tests__/middleware.test.ts`
Expected: FAIL.

- [ ] **Step 3: Reescrever `src/middleware.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/tools/:path*', '/api/tools/:path*', '/api/agents/:path*', '/admin/:path*'],
}
```

- [ ] **Step 4: Criar `src/app/admin/layout.tsx` (guard de role)**

```tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') redirect('/tools')
  return <>{children}</>
}
```

- [ ] **Step 5: Rodar — deve PASSAR**

Run: `npx jest src/__tests__/middleware.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**
```bash
git add src/middleware.ts src/app/admin/layout.tsx src/__tests__/middleware.test.ts
git commit -m "feat(auth): middleware por cookie + guard /admin em layout server component"
```

---

### Task 5: Admin CRUD (server actions + página + componentes)

**Files:**
- Modify: `src/app/admin/actions.ts`, `src/app/admin/page.tsx`
- Modify: `src/components/admin/MemberRow.tsx`, `src/components/admin/EditPermissionsForm.tsx`, `src/components/admin/CreateMemberForm.tsx`
- Test: `src/__tests__/adminActions.test.ts`, `src/components/admin/__tests__/*` (atualizar)

**Interfaces:**
- Consumes: `auth.api.{createUser,setRole,banUser,unbanUser,removeUser,setUserPassword,listUsers,getSession}`; `permissions.ts` (`setUserTools`, `getAllToolPermissions`).
- Produces: server actions `createMember`, `updatePermissions`, `disableMember`, `reactivateMember`, `deleteMember`, `resetPassword`.

- [ ] **Step 1: Atualizar os testes de admin (falhando)**

Ler `adminActions.test.ts` e os testes de componentes. Trocar mocks do Supabase admin client por mocks de `@/lib/auth` (`auth.api.*`) e `@/lib/permissions`. Asserts:
- `requireAdmin` lança se sessão ausente ou `role !== 'admin'`;
- `createMember` chama `auth.api.createUser` com `{ email, password, name, role }` e `setUserTools(newId, tools)`;
- `updatePermissions` chama `auth.api.setRole` e `setUserTools`;
- `disableMember`/`reactivateMember` chamam `banUser`/`unbanUser`;
- `deleteMember` chama `removeUser`;
- `resetPassword` chama `setUserPassword`.

- [ ] **Step 2: Rodar — deve FALHAR**

Run: `npx jest src/__tests__/adminActions.test.ts src/components/admin`
Expected: FAIL.

- [ ] **Step 3: Reescrever `src/app/admin/actions.ts`**

```ts
'use server'
import { auth } from '@/lib/auth'
import { setUserTools } from '@/lib/permissions'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized')
  return session
}

export async function createMember(
  name: string, email: string, password: string,
  role: 'admin' | 'member', tools: string[],
) {
  await requireAdmin()
  const res = await auth.api.createUser({ body: { name, email, password, role } })
  await setUserTools(res.user.id, tools)
  revalidatePath('/admin')
}

export async function updatePermissions(
  userId: string, tools: string[], role: 'admin' | 'member',
) {
  await requireAdmin()
  await auth.api.setRole({ body: { userId, role }, headers: await headers() })
  await setUserTools(userId, tools)
  revalidatePath('/admin')
}

export async function disableMember(userId: string) {
  await requireAdmin()
  await auth.api.banUser({ body: { userId }, headers: await headers() })
  revalidatePath('/admin')
}

export async function reactivateMember(userId: string) {
  await requireAdmin()
  await auth.api.unbanUser({ body: { userId }, headers: await headers() })
  revalidatePath('/admin')
}

export async function deleteMember(userId: string) {
  await requireAdmin()
  await auth.api.removeUser({ body: { userId }, headers: await headers() })
  revalidatePath('/admin')
}

export async function resetPassword(userId: string, newPassword: string) {
  await requireAdmin()
  await auth.api.setUserPassword({ body: { userId, newPassword }, headers: await headers() })
}
```
> Nota: confirmar os nomes exatos dos campos do body na versão instalada do better-auth (ex.: `setUserPassword` usa `newPassword`; `banUser` aceita `banReason`/`banExpiresIn` opcionais). Ajustar se o TS acusar.

- [ ] **Step 4: Reescrever `src/app/admin/page.tsx`**

Ler o atual. Trocar a montagem da lista: 
```ts
const { users } = await auth.api.listUsers({ query: { limit: 100 }, headers: await headers() })
const perms = await getAllToolPermissions()
const permsByUser = new Map<string, string[]>()
for (const p of perms) permsByUser.set(p.userId, [...(permsByUser.get(p.userId) ?? []), p.toolSlug])
const members: Member[] = users.map((u) => ({
  id: u.id,
  email: u.email,
  name: u.name ?? '',
  role: (u.role as 'admin' | 'member') ?? 'member',
  tools: permsByUser.get(u.id) ?? [],
  bannedUntil: u.banned ? (u.banExpires ?? 'banned') : null,
}))
```
Manter o resto (render de `<CreateMemberForm/>` + `<MemberList members={members}/>`).

- [ ] **Step 5: Atualizar componentes admin**

- `MemberList.tsx`: o tipo `Member` já tem os campos usados acima; ajustar `bannedUntil` para `string | null`.
- `EditPermissionsForm.tsx`: chamar `updatePermissions(member.id, selectedTools, role)` (remover o 4º arg `currentAppMetadata`).
- `MemberRow.tsx`: adicionar botão "Redefinir senha" que abre um input e chama a nova action `resetPassword(member.id, novaSenha)`. Manter as demais ações (editar/desativar/reativar/excluir) apontando para as actions atualizadas.
- `CreateMemberForm.tsx`: sem mudança de contrato (já chama `createMember(name, email, password, role, tools)`); confirmar assinatura.

- [ ] **Step 6: Rodar — deve PASSAR**

Run: `npx jest src/__tests__/adminActions.test.ts src/components/admin`
Expected: PASS.

- [ ] **Step 7: Commit**
```bash
git add src/app/admin src/components/admin src/__tests__/adminActions.test.ts
git commit -m "feat(auth): admin CRUD via Better Auth (createUser/setRole/ban/remove/setPassword)"
```

---

### Task 6: Enforcement de permissão por ferramenta

**Files:**
- Modify: `src/app/tools/[slug]/page.tsx`
- Test: criar/atualizar teste de gating (ex.: `src/__tests__/ToolPageGating.test.tsx`)

**Interfaces:**
- Consumes: `auth.api.getSession`, `hasToolPermission` de `permissions.ts`, `LockedToolShell`.

- [ ] **Step 1: Escrever o teste de gating (falhando)**

Mock de `@/lib/auth` (`getSession` retornando um user) e `@/lib/permissions` (`hasToolPermission`). Asserts:
- tool com `requiresAuth` e `hasToolPermission=false` → renderiza `LockedToolShell`;
- `hasToolPermission=true` → renderiza a tool;
- tool sem `requiresAuth` → renderiza sem checar permissão.

- [ ] **Step 2: Rodar — deve FALHAR**

Run: `npx jest src/__tests__/ToolPageGating.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Atualizar `src/app/tools/[slug]/page.tsx`**

Ler o atual. Trocar o bloco de checagem Supabase por:
```ts
if (tool.requiresAuth) {
  const session = await auth.api.getSession({ headers: await headers() })
  const allowed = session ? await hasToolPermission(session.user.id, tool.id) : false
  if (!allowed) return <LockedToolShell toolName={tool.name} />
}
```
Manter todo o resto (resolução do tool pelo slug, render do conteúdo). `LockedToolShell` inalterado.

- [ ] **Step 4: Rodar — deve PASSAR**

Run: `npx jest src/__tests__/ToolPageGating.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/tools src/__tests__/ToolPageGating.test.tsx
git commit -m "feat(auth): gating de ferramenta via tool_permissions (Better Auth)"
```

---

### Task 7: Bootstrap do admin + limpeza + validação e2e

**Files:**
- Create: `scripts/bootstrap-admin.ts`
- Delete: `src/lib/supabase-server.ts`, `src/lib/supabase-admin.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: `auth.api.createUser`.

- [ ] **Step 1: Criar `scripts/bootstrap-admin.ts`**

```ts
import { auth } from '@/lib/auth'

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME ?? 'Admin'
  if (!email || !password) throw new Error('defina ADMIN_EMAIL e ADMIN_PASSWORD')
  const res = await auth.api.createUser({ body: { name, email, password, role: 'admin' } })
  console.log('admin criado:', res.user.id, res.user.email)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
```
Documentar no README como rodar (ex.: `DATABASE_URL=... BETTER_AUTH_SECRET=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/bootstrap-admin.ts`).

- [ ] **Step 2: Rodar o bootstrap contra o Neon**

Run: `DATABASE_URL="<neon>" BETTER_AUTH_SECRET="<secret>" BETTER_AUTH_URL=http://localhost:3000 ADMIN_EMAIL="voce@flyingstudio.com.br" ADMIN_PASSWORD="<senha forte>" npx tsx scripts/bootstrap-admin.ts`
Expected: imprime "admin criado" com um id. Confirmar 1 linha em `user` com `role='admin'`.

- [ ] **Step 3: Remover os arquivos Supabase de auth**

```bash
git rm src/lib/supabase-server.ts src/lib/supabase-admin.ts
```
Confirmar que nada mais os importa:
Run: `grep -rn "supabase-server\|supabase-admin\|@supabase/ssr" src/ || echo "limpo"`
Expected: `limpo`.

- [ ] **Step 4: Suíte completa**

Run: `npx jest` (com `DATABASE_URL` do Neon para os testes de integração)
Expected: verde. Registrar total; qualquer falha remanescente deve ser justificada (ex.: teste de Storage inalterado).

- [ ] **Step 5: Validação e2e local**

```bash
DATABASE_URL="<neon>" BETTER_AUTH_SECRET="<secret>" BETTER_AUTH_URL=http://localhost:3000 npm run dev
```
Validar manualmente: (a) `/login` com o admin do bootstrap entra; (b) `/admin` acessível como admin; (c) criar um membro `member` com acesso só a `pesquisador`; (d) logar como esse membro → `/admin` redireciona para `/tools`; (e) abrir a tool `lumen` sem permissão → `LockedToolShell`; (f) dar permissão de `lumen` pelo painel → tool abre. Registrar resultados.

- [ ] **Step 6: Commit**
```bash
git add -A
git commit -m "feat(auth): bootstrap admin + remover Supabase Auth + validação e2e"
```

---

## Self-Review

**Cobertura da spec:**
- Better Auth core + pg Pool + admin plugin + nextCookies → Task 1 ✅
- Tabelas Better Auth + `tool_permissions` no Neon → Task 1 ✅
- `permissions.ts` (queries) → Task 2 ✅
- Login individual (sem conta de equipe) + logout → Task 3 ✅
- Middleware por cookie + guard `/admin` em layout → Task 4 ✅
- Admin CRUD (create/setRole/ban/unban/remove/setPassword) + página + componentes → Task 5 ✅
- Gating por ferramenta → Task 6 ✅
- Bootstrap admin + remoção do Supabase Auth + e2e → Task 7 ✅
- Storage/`supabase.ts` intactos; LUMEN intacta → Global Constraints ✅

**Riscos/observações:**
- Nomes exatos dos bodies dos endpoints admin (`banUser`, `setUserPassword`, `listUsers` query) podem variar por versão do better-auth — cada task roda o TS/testes e ajusta; o plano marca isso explicitamente na Task 5.
- Testes de integração dependem do Neon real (schema já migrado). Alternativa: um banco/schema de teste dedicado se não quiser tocar o de dev.
- `getSessionCookie` no middleware é checagem de presença (otimista); a autorização real (role/ban) é validada server-side no layout/actions/`getSession` — defesa em profundidade.
- Placeholders: nenhum. Para arquivos MODIFICADOS, o implementador lê o arquivo atual antes de aplicar o código-alvo indicado (preservando layout/estilo existentes).
