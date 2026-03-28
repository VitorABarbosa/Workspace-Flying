import { NextRequest, NextResponse } from 'next/server'

const LUMEN_URL = process.env.NEXT_PUBLIC_LUMEN_URL ?? ''

/**
 * Proxy all requests to the LUMEN FastAPI backend.
 * Preserves method, headers, and body.
 * Route: /api/tools/lumen/[...route]
 * Examples:
 *   POST /api/tools/lumen/search              → POST {LUMEN_URL}/search
 *   GET  /api/tools/lumen/search/{id}/status  → GET  {LUMEN_URL}/search/{id}/status
 *   POST /api/tools/lumen/search/{id}/cancel  → POST {LUMEN_URL}/search/{id}/cancel
 */
async function handler(req: NextRequest, { params }: { params: { route: string[] } }) {
  if (!LUMEN_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_LUMEN_URL not configured' }, { status: 503 })
  }

  const path = params.route.join('/')
  const url = `${LUMEN_URL}/${path}${req.nextUrl.search}`

  const isJson = req.headers.get('content-type')?.includes('application/json')
  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? isJson
      ? await req.text()
      : await req.formData()
    : undefined

  const headers = new Headers()
  const contentType = req.headers.get('content-type')
  if (contentType && isJson) headers.set('content-type', contentType)
  // Note: do NOT forward multipart boundary — fetch will set it automatically for FormData

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: body instanceof FormData ? body : (body as string | undefined),
  })

  const responseBody = await upstream.text()
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }
