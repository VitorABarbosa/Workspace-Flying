/**
 * Cria o PRIMEIRO usuário admin do Workspace (rodar uma vez).
 * Uso:
 *   DATABASE_URL=... BETTER_AUTH_SECRET=... BETTER_AUTH_URL=http://localhost:3000 \
 *   ADMIN_EMAIL=voce@flyingstudio.com.br ADMIN_PASSWORD='<senha forte>' ADMIN_NAME='Seu Nome' \
 *   npx tsx scripts/bootstrap-admin.ts
 */
import { auth, pool } from '@/lib/auth'

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME ?? 'Admin'
  if (!email || !password) {
    console.error('defina ADMIN_EMAIL e ADMIN_PASSWORD')
    process.exit(1)
  }
  const res = await auth.api.createUser({
    body: { name, email, password, role: 'admin' as 'admin' | 'user' },
  })
  console.log('admin criado:', res.user.id, res.user.email, '| role:', (res.user as { role?: string }).role)
  await pool.end()
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
