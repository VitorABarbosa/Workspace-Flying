'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Internal guard — must be first call in every exported action
async function requireAdmin() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.app_metadata?.role !== 'admin') {
    throw new Error('Unauthorized')
  }
}

export async function createMember(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'member',
  authorizedTools: string[]
): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createSupabaseAdminClient()

  const { data: { user }, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
    app_metadata: { role },
  })

  if (error) return { error: error.message }

  if (user && authorizedTools.length > 0) {
    await admin
      .from('tool_permissions')
      .insert(authorizedTools.map((slug) => ({ user_id: user.id, tool_slug: slug })))
  }

  revalidatePath('/admin')
  return {}
}

export async function updatePermissions(
  userId: string,
  tools: string[],
  role: 'admin' | 'member',
  currentAppMetadata: Record<string, unknown>
): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createSupabaseAdminClient()

  // Delete all existing permissions for this user, then insert the new set
  await admin.from('tool_permissions').delete().eq('user_id', userId)

  if (tools.length > 0) {
    await admin
      .from('tool_permissions')
      .insert(tools.map((slug) => ({ user_id: userId, tool_slug: slug })))
  }

  // Update role — spread existing app_metadata to avoid overwriting other fields (Pitfall 6)
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { ...currentAppMetadata, role },
  })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return {}
}

export async function disableMember(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createSupabaseAdminClient()

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876600h',
  })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return {}
}

export async function reactivateMember(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createSupabaseAdminClient()

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return {}
}

export async function deleteMember(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createSupabaseAdminClient()

  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return {}
}
