import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// AUTH-02: proteção de rotas por checagem OTIMISTA de cookie de sessão.
// Sem hit no banco — compatível com edge runtime. O guard de ROLE de admin
// não vive mais aqui: ver src/app/admin/layout.tsx.
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/tools/:path*', '/api/tools/:path*', '/api/agents/:path*', '/admin/:path*'],
}
