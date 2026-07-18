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
