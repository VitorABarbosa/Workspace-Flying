// middleware.test.ts — testa proteção de rotas /tools/* (AUTH-02)
// Checagem otimista por cookie (better-auth/cookies), sem hit no banco.
// Guard de role de admin saiu do middleware — ver src/app/admin/layout.tsx.

// Mock better-auth/cookies — antes de qualquer import
const mockGetSessionCookie = jest.fn()
jest.mock('better-auth/cookies', () => ({
  getSessionCookie: (...args: unknown[]) => mockGetSessionCookie(...args),
}))

// Mock next/server — usar jest.fn() dentro do factory para evitar hoisting issues
jest.mock('next/server', () => {
  const mockRedirect = jest.fn((url: URL) => ({
    type: 'redirect' as const,
    url: url.toString(),
  }))
  const mockNext = jest.fn(() => ({
    type: 'next' as const,
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
  })

  it('redireciona para /login quando não há cookie de sessão', () => {
    mockGetSessionCookie.mockReturnValue(null)
    middleware(makeRequest('/tools/any'))
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1)
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/login')
  })

  it('passa a requisição (NextResponse.next) quando há cookie de sessão', () => {
    mockGetSessionCookie.mockReturnValue('some-session-cookie-value')
    middleware(makeRequest('/tools/any'))
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect(NextResponse.next).toHaveBeenCalledTimes(1)
  })

  it('redireciona para /login em rota /admin sem cookie de sessão', () => {
    mockGetSessionCookie.mockReturnValue(null)
    middleware(makeRequest('/admin'))
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1)
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/login')
  })

  it('passa a requisição em rota /admin quando há cookie de sessão (role fica a cargo do layout)', () => {
    mockGetSessionCookie.mockReturnValue('some-session-cookie-value')
    middleware(makeRequest('/admin'))
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect(NextResponse.next).toHaveBeenCalledTimes(1)
  })

  it('matcher config inclui /tools/:path*', () => {
    expect(config.matcher).toContain('/tools/:path*')
  })

  it('matcher config inclui /api/tools/:path*', () => {
    expect(config.matcher).toContain('/api/tools/:path*')
  })

  it('matcher config inclui /api/agents/:path*', () => {
    expect(config.matcher).toContain('/api/agents/:path*')
  })

  it('matcher config inclui /admin/:path*', () => {
    expect(config.matcher).toContain('/admin/:path*')
  })
})
