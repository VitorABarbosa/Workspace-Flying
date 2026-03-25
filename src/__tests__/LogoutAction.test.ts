// LogoutAction.test.ts — testa server action de logout (AUTH-03)

// Mock supabase-server antes de importar o módulo alvo
const mockSignOut = jest.fn().mockResolvedValue({})
jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: () => ({
    auth: { signOut: mockSignOut },
  }),
}))

// Mock next/navigation redirect
const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { logout } = require('@/app/actions/auth')

describe('logout action (AUTH-03)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignOut.mockResolvedValue({})
  })

  it('chama supabase.auth.signOut()', async () => {
    try {
      await logout()
    } catch {
      // redirect() lança em servidor — ignorar
    }
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('redireciona para /login após signOut', async () => {
    try {
      await logout()
    } catch {
      // redirect() lança em servidor — ignorar
    }
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
