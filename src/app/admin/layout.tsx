import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// PERM-06: guard de role de admin — antes vivia no middleware (edge),
// agora roda aqui como server component (pode consultar o banco via getSession).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    redirect('/tools')
  }

  return <>{children}</>
}
