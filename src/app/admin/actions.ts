'use server'

import { auth } from '@/lib/auth'
import { setUserTools } from '@/lib/permissions'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Internal guard — must be first call in every exported action.
// Reads role from the Better Auth session; throws so callers reject on non-admin.
async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized')
  return session
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Erro inesperado'
}

export async function createMember(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'member',
  tools: string[]
): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    const res = await auth.api.createUser({
      // role cast: app uses 'member' (configured defaultRole) which the schema
      // accepts at runtime; the plugin's inferred type only narrows to 'admin' | 'user'.
      body: { name, email, password, role: role as 'admin' | 'user' },
    })
    await setUserTools(res.user.id, tools)
    revalidatePath('/admin')
    return {}
  } catch (e) {
    return { error: errorMessage(e) }
  }
}

export async function updatePermissions(
  userId: string,
  tools: string[],
  role: 'admin' | 'member'
): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    await auth.api.setRole({
      body: { userId, role: role as 'admin' | 'user' },
      headers: await headers(),
    })
    await setUserTools(userId, tools)
    revalidatePath('/admin')
    return {}
  } catch (e) {
    return { error: errorMessage(e) }
  }
}

export async function disableMember(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    await auth.api.banUser({ body: { userId }, headers: await headers() })
    revalidatePath('/admin')
    return {}
  } catch (e) {
    return { error: errorMessage(e) }
  }
}

export async function reactivateMember(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    await auth.api.unbanUser({ body: { userId }, headers: await headers() })
    revalidatePath('/admin')
    return {}
  } catch (e) {
    return { error: errorMessage(e) }
  }
}

export async function deleteMember(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    await auth.api.removeUser({ body: { userId }, headers: await headers() })
    revalidatePath('/admin')
    return {}
  } catch (e) {
    return { error: errorMessage(e) }
  }
}

export async function resetPassword(
  userId: string,
  newPassword: string
): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    await auth.api.setUserPassword({ body: { userId, newPassword }, headers: await headers() })
    return {}
  } catch (e) {
    return { error: errorMessage(e) }
  }
}
