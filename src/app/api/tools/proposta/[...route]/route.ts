import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { hasToolPermission } from '@/lib/permissions'

const PROPOSTA_URL = process.env.PROPOSTA_URL ?? ''
const PROPOSTA_API_TOKEN = process.env.PROPOSTA_API_TOKEN ?? ''

/**
 * Proxy all requests to the aut-proposta FastAPI backend.
 * Preserves method, headers, and body; injeta o Bearer server-side.
 * Route: /api/tools/proposta/[...route]
 * Examples:
 *   POST /api/tools/proposta/levantamento          → POST {PROPOSTA_URL}/levantamento
 *   GET  /api/tools/proposta/propostas              → GET  {PROPOSTA_URL}/propostas
 *   GET  /api/tools/proposta/propostas/{id}/docx    → GET  {PROPOSTA_URL}/propostas/{id}/docx
 */
async function handler(req: NextRequest, { params }: { params: { route: string[] } }) {
  // Autorização por-ferramenta: o gate de UI em tools/[slug]/page.tsx NÃO protege
  // esta superfície de dados. Exige sessão + permissão da ferramenta 'proposta'.
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!(await hasToolPermission(session.user.id, 'proposta'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!PROPOSTA_URL || !PROPOSTA_API_TOKEN) {
    return NextResponse.json({ error: 'PROPOSTA_URL/PROPOSTA_API_TOKEN not configured' }, { status: 503 })
  }

  const path = params.route.join('/')
  const url = `${PROPOSTA_URL}/${path}${req.nextUrl.search}`

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
  headers.set('Authorization', `Bearer ${PROPOSTA_API_TOKEN}`)
  if (contentType && isJson) headers.set('content-type', contentType)
  // Note: do NOT forward multipart boundary — fetch will set it automatically for FormData

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: body instanceof FormData ? body : (body as string | undefined),
  })

  const upstreamContentType = upstream.headers.get('content-type') ?? 'application/json'
  const isBinary = upstreamContentType.includes('spreadsheetml') ||
    upstreamContentType.includes('wordprocessingml') ||
    upstreamContentType.includes('octet-stream') ||
    upstreamContentType.includes('zip') ||
    upstreamContentType.includes('application/pdf')
  const responseBody = isBinary
    ? await upstream.arrayBuffer()
    : await upstream.text()

  const responseHeaders: Record<string, string> = { 'content-type': upstreamContentType }
  const disposition = upstream.headers.get('content-disposition')
  if (disposition) responseHeaders['content-disposition'] = disposition

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }
