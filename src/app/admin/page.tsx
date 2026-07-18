export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getAllToolPermissions } from '@/lib/permissions'
import { MemberList } from '@/components/admin/MemberList'
import type { Member } from '@/components/admin/MemberList'
import { CreateMemberForm } from '@/components/admin/CreateMemberForm'

export default async function AdminPage() {
  // Fetch all users via Better Auth admin plugin (team < 50 — single page)
  const { users } = await auth.api.listUsers({
    query: { limit: 100 },
    headers: await headers(),
  })

  // Fetch all tool_permissions rows (bypasses RLS via direct pg pool)
  const perms = await getAllToolPermissions()
  const permsByUser = new Map<string, string[]>()
  for (const p of perms) {
    permsByUser.set(p.userId, [...(permsByUser.get(p.userId) ?? []), p.toolSlug])
  }

  const members: Member[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name ?? '',
    role: (u.role as 'admin' | 'member' | undefined) ?? 'member',
    tools: permsByUser.get(u.id) ?? [],
    bannedUntil: u.banned ? (u.banExpires ? String(u.banExpires) : 'banned') : null,
  }))

  return (
    <section className="py-20 px-6 max-w-[1200px] mx-auto">
      <h1 className="text-[22px] font-bold text-[#1A1A2E] dark:text-white mb-8">
        Painel Admin
      </h1>
      <div className="mb-10">
        <CreateMemberForm />
      </div>
      <MemberList members={members} />
    </section>
  )
}
