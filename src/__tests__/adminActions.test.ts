// adminActions.test.ts — unit tests for Server Actions in src/app/admin/actions.ts
// Migrated from Supabase Admin API to Better Auth admin plugin (auth.api.*) + permissions.ts

const mockGetSession = jest.fn()
const mockCreateUser = jest.fn()
const mockSetRole = jest.fn()
const mockBanUser = jest.fn()
const mockUnbanUser = jest.fn()
const mockRemoveUser = jest.fn()
const mockSetUserPassword = jest.fn()

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      createUser: (...args: unknown[]) => mockCreateUser(...args),
      setRole: (...args: unknown[]) => mockSetRole(...args),
      banUser: (...args: unknown[]) => mockBanUser(...args),
      unbanUser: (...args: unknown[]) => mockUnbanUser(...args),
      removeUser: (...args: unknown[]) => mockRemoveUser(...args),
      setUserPassword: (...args: unknown[]) => mockSetUserPassword(...args),
    },
  },
}))

const mockSetUserTools = jest.fn()
jest.mock('@/lib/permissions', () => ({
  setUserTools: (...args: unknown[]) => mockSetUserTools(...args),
}))

jest.mock('next/headers', () => ({ headers: jest.fn().mockResolvedValue(new Headers()) }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import {
  createMember,
  updatePermissions,
  disableMember,
  reactivateMember,
  deleteMember,
  resetPassword,
} from '@/app/admin/actions'

const adminSession = { user: { id: 'admin-1', role: 'admin' } }
const memberSession = { user: { id: 'member-1', role: 'member' } }

beforeEach(() => {
  jest.clearAllMocks()
  mockSetUserTools.mockResolvedValue(undefined)
  mockCreateUser.mockResolvedValue({ user: { id: 'new-user' } })
  mockSetRole.mockResolvedValue({})
  mockBanUser.mockResolvedValue({})
  mockUnbanUser.mockResolvedValue({})
  mockRemoveUser.mockResolvedValue({})
  mockSetUserPassword.mockResolvedValue({})
})

describe('requireAdmin — guard em todas as actions', () => {
  it('createMember lança Unauthorized quando não há sessão', async () => {
    mockGetSession.mockResolvedValue(null)
    await expect(createMember('Ana', 'ana@test.com', 'pass', 'member', [])).rejects.toThrow('Unauthorized')
  })

  it('createMember lança Unauthorized quando caller não é admin', async () => {
    mockGetSession.mockResolvedValue(memberSession)
    await expect(createMember('Ana', 'ana@test.com', 'pass', 'member', [])).rejects.toThrow('Unauthorized')
  })

  it('disableMember lança Unauthorized quando caller não é admin', async () => {
    mockGetSession.mockResolvedValue(memberSession)
    await expect(disableMember('some-user-id')).rejects.toThrow('Unauthorized')
  })

  it('deleteMember lança Unauthorized quando caller não é admin', async () => {
    mockGetSession.mockResolvedValue(memberSession)
    await expect(deleteMember('some-user-id')).rejects.toThrow('Unauthorized')
  })

  it('updatePermissions lança Unauthorized quando caller não é admin', async () => {
    mockGetSession.mockResolvedValue(memberSession)
    await expect(updatePermissions('uid', [], 'member')).rejects.toThrow('Unauthorized')
  })

  it('resetPassword lança Unauthorized quando caller não é admin', async () => {
    mockGetSession.mockResolvedValue(memberSession)
    await expect(resetPassword('uid', 'nova-senha')).rejects.toThrow('Unauthorized')
  })
})

describe('createMember (PERM-08)', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(adminSession)
  })

  it('chama auth.api.createUser com { name, email, password, role }', async () => {
    await createMember('Ana Lima', 'ana@test.com', 'senha123', 'member', ['lumen'])
    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { name: 'Ana Lima', email: 'ana@test.com', password: 'senha123', role: 'member' },
      })
    )
  })

  it('chama setUserTools com o novo id e as ferramentas', async () => {
    await createMember('Ana', 'ana@test.com', 'pass', 'member', ['lumen', 'pesquisador'])
    expect(mockSetUserTools).toHaveBeenCalledWith('new-user', ['lumen', 'pesquisador'])
  })

  it('retorna { error } quando createUser falha', async () => {
    mockCreateUser.mockRejectedValue(new Error('Email already registered'))
    const result = await createMember('Ana', 'ana@test.com', 'pass', 'member', [])
    expect(result).toEqual({ error: 'Email already registered' })
  })
})

describe('updatePermissions (PERM-09)', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(adminSession)
  })

  it('chama auth.api.setRole com { userId, role }', async () => {
    await updatePermissions('user-2', ['lumen'], 'admin')
    expect(mockSetRole).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: 'user-2', role: 'admin' } })
    )
  })

  it('chama setUserTools com o userId e o novo conjunto de ferramentas', async () => {
    await updatePermissions('user-2', ['lumen'], 'member')
    expect(mockSetUserTools).toHaveBeenCalledWith('user-2', ['lumen'])
  })
})

describe('disableMember (PERM-10)', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(adminSession)
  })

  it('chama auth.api.banUser com { userId }', async () => {
    await disableMember('user-2')
    expect(mockBanUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: 'user-2' } })
    )
  })
})

describe('reactivateMember', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(adminSession)
  })

  it('chama auth.api.unbanUser com { userId }', async () => {
    await reactivateMember('user-2')
    expect(mockUnbanUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: 'user-2' } })
    )
  })
})

describe('deleteMember (PERM-10)', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(adminSession)
  })

  it('chama auth.api.removeUser com { userId }', async () => {
    await deleteMember('user-2')
    expect(mockRemoveUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: 'user-2' } })
    )
  })
})

describe('resetPassword', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(adminSession)
  })

  it('chama auth.api.setUserPassword com { userId, newPassword }', async () => {
    await resetPassword('user-2', 'nova-senha')
    expect(mockSetUserPassword).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: 'user-2', newPassword: 'nova-senha' } })
    )
  })
})
