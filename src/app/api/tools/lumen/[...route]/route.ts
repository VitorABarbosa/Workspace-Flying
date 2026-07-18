import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { hasToolPermission } from '@/lib/permissions'

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

  // Autorização por-ferramenta: o gate de UI em tools/[slug]/page.tsx NÃO protege
  // esta superfície de dados. Exige sessão + permissão da ferramenta 'lumen'.
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!(await hasToolPermission(session.user.id, 'lumen'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let path = params.route.join('/')

  // GET /search/{uuid} → backend expects /search/{uuid}/status
  const isStatusPoll =
    req.method === 'GET' &&
    /^search\/[0-9a-f-]{36}$/.test(path)
  if (isStatusPoll) path = `${path}/status`

  const url = `${LUMEN_URL}/${path}${req.nextUrl.search}`

  const contentType = req.headers.get('content-type')
  const isJson = contentType?.includes('application/json') ?? false
  const isFormData = contentType?.includes('multipart/form-data') ?? false
  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? isJson
      ? await req.text()
      : isFormData
        ? await req.formData()
        : undefined
    : undefined

  const headers = new Headers()
  if (contentType && isJson) headers.set('content-type', contentType)
  // Note: do NOT forward multipart boundary — fetch will set it automatically for FormData

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: body instanceof FormData ? body : (body as string | undefined),
  })

  const upstreamContentType = upstream.headers.get('content-type') ?? 'application/json'
  const isBinary = upstreamContentType.includes('spreadsheetml') ||
    upstreamContentType.includes('octet-stream') ||
    upstreamContentType.includes('zip')
  const responseBody = isBinary
    ? await upstream.arrayBuffer()
    : await upstream.text()
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: { 'content-type': upstreamContentType },
  })
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }
