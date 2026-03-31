// middleware.test.ts — testa proteção de rotas /tools/* (AUTH-02)

// Mock @supabase/ssr — antes de qualquer import
const mockGetUser = jest.fn()
jest.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}))

// Mock next/server — usar jest.fn() dentro do factory para evitar hoisting issues
jest.mock('next/server', () => {
  const mockRedirect = jest.fn((url: URL) => ({
    type: 'redirect' as const,
    url: url.toString(),
    cookies: { set: jest.fn(), getAll: jest.fn(() => []) },
  }))
  const mockNext = jest.fn(() => ({
    type: 'next' as const,
    cookies: { set: jest.fn(), getAll: jest.fn(() => []) },
  }))
  return {
    NextResponse: {
      redirect: mockRedirect,
      next: mockNext,
    },
  }
})

import { middleware, config } from '@/middleware'
import { NextResponse } from 'next/server'

// Simular NextRequest
function makeRequest(pathname: string) {
  return {
    url: `http://localhost:3000${pathname}`,
    headers: new Headers(),
    cookies: {
      getAll: () => [],
      set: jest.fn(),
    },
    nextUrl: { pathname },
  } as unknown as import('next/server').NextRequest
}

describe('middleware — proteção de rotas (AUTH-02)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(NextResponse.next as jest.Mock).mockReturnValue({
      type: 'next',
      cookies: { set: jest.fn(), getAll: jest.fn(() => []) },
    })
  })

  it('redireciona para /login quando usuário não está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await middleware(makeRequest('/tools/any'))
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1)
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/login')
  })

  it('passa a requisição quando usuário está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    await middleware(makeRequest('/tools/any'))
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('matcher config inclui /tools/:path*', () => {
    expect(config.matcher).toContain('/tools/:path*')
  })

  it('matcher config inclui /api/tools/:path*', () => {
    expect(config.matcher).toContain('/api/tools/:path*')
  })
})

describe('middleware — proteção de rotas admin (PERM-06)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(NextResponse.next as jest.Mock).mockReturnValue({
      type: 'next',
      cookies: { set: jest.fn(), getAll: jest.fn(() => []) },
    })
  })

  it('redireciona role=member de /admin para /tools', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'member-1', app_metadata: { role: 'member' } } },
    })
    await middleware(makeRequest('/admin'))
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1)
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/tools')
  })

  it('redireciona usuário não autenticado de /admin para /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await middleware(makeRequest('/admin'))
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1)
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/login')
  })

  it('permite role=admin acessar /admin sem redirecionamento', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', app_metadata: { role: 'admin' } } },
    })
    await middleware(makeRequest('/admin'))
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('matcher config inclui /admin/:path*', () => {
    expect(config.matcher).toContain('/admin/:path*')
  })
})
