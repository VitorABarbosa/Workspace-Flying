/**
 * @jest-environment node
 */
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
