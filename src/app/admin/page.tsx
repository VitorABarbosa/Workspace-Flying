import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { MemberList } from '@/components/admin/MemberList'
import type { Member } from '@/components/admin/MemberList'

export default async function AdminPage() {
  const admin = createSupabaseAdminClient()

  // Fetch all auth users (team < 50 — no pagination needed per RESEARCH.md)
  const { data: { users }, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 50,
  })
  if (usersError) throw usersError

  // Fetch all tool_permissions rows (admin client bypasses RLS)
  const { data: allPermissions } = await admin
    .from('tool_permissions')
    .select('user_id, tool_slug')

  // Join in JavaScript: user_id → tool_slug[]
  const permissionsMap = new Map<string, string[]>()
  for (const row of (allPermissions ?? [])) {
    const existing = permissionsMap.get(row.user_id) ?? []
    permissionsMap.set(row.user_id, [...existing, row.tool_slug])
  }

  const members: Member[] = users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    name: (u.user_metadata?.full_name as string | undefined) ?? '',
    role: (u.app_metadata?.role as 'admin' | 'member' | undefined) ?? 'member',
    tools: permissionsMap.get(u.id) ?? [],
    bannedUntil: u.banned_until,
  }))

  return (
    <section className="py-20 px-6 max-w-[1200px] mx-auto">
      <h1 className="text-[22px] font-bold text-[#1A1A2E] dark:text-white mb-8">
        Painel Admin
      </h1>
      <MemberList members={members} />
    </section>
  )
}
