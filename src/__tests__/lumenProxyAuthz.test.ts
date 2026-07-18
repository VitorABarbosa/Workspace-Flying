process.env.NEXT_PUBLIC_LUMEN_URL = 'http://lumen.test'

jest.mock('@/lib/auth', () => ({ auth: { api: { getSession: jest.fn() } } }))
jest.mock('@/lib/permissions', () => ({ hasToolPermission: jest.fn() }))

import { auth } from '@/lib/auth'
import { hasToolPermission } from '@/lib/permissions'

const mockGetSession = (auth as unknown as { api: { getSession: jest.Mock } }).api.getSession
const mockHasPerm = hasToolPermission as jest.Mock

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let GET: (req: any, ctx: any) => Promise<Response>

beforeAll(async () => {
  // import dinâmico após setar env e mocks (LUMEN_URL é lido no load do módulo)
  ;({ GET } = await import('@/app/api/tools/lumen/[...route]/route'))
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeReq(): any {
  return { method: 'GET', headers: new Headers(), nextUrl: { search: '' } }
}

describe('LUMEN proxy — autorização por ferramenta', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('401 quando não há sessão', async () => {
    mockGetSession.mockResolvedValue(null)
    const res = await GET(makeReq(), { params: { route: ['leads'] } })
    expect(res.status).toBe(401)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('403 quando a sessão não tem permissão de lumen', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    mockHasPerm.mockResolvedValue(false)
    const res = await GET(makeReq(), { params: { route: ['leads'] } })
    expect(res.status).toBe(403)
    expect(mockHasPerm).toHaveBeenCalledWith('u1', 'lumen')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('proxia para o backend quando tem permissão', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    mockHasPerm.mockResolvedValue(true)
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } }),
    )
    const res = await GET(makeReq(), { params: { route: ['leads'] } })
    expect(global.fetch).toHaveBeenCalledWith('http://lumen.test/leads', expect.anything())
    expect(res.status).toBe(200)
  })
})
