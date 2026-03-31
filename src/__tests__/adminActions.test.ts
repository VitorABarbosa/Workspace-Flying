// adminActions.test.ts — unit tests for Server Actions in src/app/admin/actions.ts

const mockGetUser = jest.fn()
const mockCreateUser = jest.fn()
const mockUpdateUserById = jest.fn()
const mockDeleteUser = jest.fn()
const mockFrom = jest.fn()

// Mock supabase-server (for requireAdmin check)
jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}))

// Mock supabase-admin (for all admin operations)
jest.mock('@/lib/supabase-admin', () => ({
  createSupabaseAdminClient: () => ({
    auth: {
      admin: {
        createUser: mockCreateUser,
        updateUserById: mockUpdateUserById,
        deleteUser: mockDeleteUser,
      },
    },
    from: mockFrom,
  }),
}))

// Mock next/cache (revalidatePath is a no-op in tests)
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import {
  createMember,
  updatePermissions,
  disableMember,
  reactivateMember,
  deleteMember,
} from '@/app/admin/actions'

const adminUser = { id: 'admin-1', app_metadata: { role: 'admin' } }
const memberUser = { id: 'member-1', app_metadata: { role: 'member' } }

beforeEach(() => {
  jest.clearAllMocks()
  // Default: from() returns a chainable mock (delete().eq() and insert())
  const chainMock = {
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null }),
    insert: jest.fn().mockResolvedValue({ error: null }),
    select: jest.fn().mockReturnThis(),
  }
  mockFrom.mockReturnValue(chainMock)
})

describe('requireAdmin — guard em todas as actions', () => {
  it('createMember lança Unauthorized quando caller não é admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: memberUser } })
    await expect(createMember('Ana', 'ana@test.com', 'pass', 'member', [])).rejects.toThrow('Unauthorized')
  })

  it('disableMember lança Unauthorized quando caller não é admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: memberUser } })
    await expect(disableMember('some-user-id')).rejects.toThrow('Unauthorized')
  })

  it('deleteMember lança Unauthorized quando caller não é admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: memberUser } })
    await expect(deleteMember('some-user-id')).rejects.toThrow('Unauthorized')
  })

  it('updatePermissions lança Unauthorized quando caller não é admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: memberUser } })
    await expect(updatePermissions('uid', [], 'member', {})).rejects.toThrow('Unauthorized')
  })
})

describe('createMember (PERM-08)', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: adminUser } })
  })

  it('chama createUser com email_confirm: true e app_metadata.role correto', async () => {
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null })
    await createMember('Ana Lima', 'ana@test.com', 'senha123', 'member', ['lumen'])
    expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({
      email: 'ana@test.com',
      email_confirm: true,
      app_metadata: { role: 'member' },
      user_metadata: { full_name: 'Ana Lima' },
    }))
  })

  it('insere tool_permissions quando ferramentas selecionadas', async () => {
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null })
    await createMember('Ana', 'ana@test.com', 'pass', 'member', ['lumen', 'pesquisador'])
    expect(mockFrom).toHaveBeenCalledWith('tool_permissions')
  })

  it('retorna { error } quando createUser falha', async () => {
    mockCreateUser.mockResolvedValue({ data: { user: null }, error: { message: 'Email already registered' } })
    const result = await createMember('Ana', 'ana@test.com', 'pass', 'member', [])
    expect(result).toEqual({ error: 'Email already registered' })
  })
})

describe('updatePermissions (PERM-09)', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: adminUser } })
    mockUpdateUserById.mockResolvedValue({ error: null })
  })

  it('deleta permissões existentes e insere o novo conjunto', async () => {
    await updatePermissions('user-2', ['lumen'], 'member', { role: 'member' })
    expect(mockFrom).toHaveBeenCalledWith('tool_permissions')
  })

  it('atualiza role usando spread de app_metadata existente (evita Pitfall 6)', async () => {
    const existingMeta = { role: 'member', provider: 'email' }
    await updatePermissions('user-2', [], 'admin', existingMeta)
    expect(mockUpdateUserById).toHaveBeenCalledWith('user-2', {
      app_metadata: { role: 'admin', provider: 'email' },
    })
  })
})

describe('disableMember (PERM-10)', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: adminUser } })
    mockUpdateUserById.mockResolvedValue({ error: null })
  })

  it('chama updateUserById com ban_duration: "876600h"', async () => {
    await disableMember('user-2')
    expect(mockUpdateUserById).toHaveBeenCalledWith('user-2', { ban_duration: '876600h' })
  })
})

describe('reactivateMember', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: adminUser } })
    mockUpdateUserById.mockResolvedValue({ error: null })
  })

  it('chama updateUserById com ban_duration: "none"', async () => {
    await reactivateMember('user-2')
    expect(mockUpdateUserById).toHaveBeenCalledWith('user-2', { ban_duration: 'none' })
  })
})

describe('deleteMember (PERM-10)', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: adminUser } })
    mockDeleteUser.mockResolvedValue({ error: null })
  })

  it('chama deleteUser com o userId correto', async () => {
    await deleteMember('user-2')
    expect(mockDeleteUser).toHaveBeenCalledWith('user-2')
  })
})
