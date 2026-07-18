// ToolPageGating.test.tsx — cobre o enforcement de permissão por ferramenta em
// src/app/tools/[slug]/page.tsx, migrado de Supabase para Better Auth + tool_permissions.

const mockGetSession = jest.fn()
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}))

const mockHasToolPermission = jest.fn()
jest.mock('@/lib/permissions', () => ({
  hasToolPermission: (...args: unknown[]) => mockHasToolPermission(...args),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue(new Headers()),
}))

// Agentes reais puxam cadeias ESM pesadas (react-markdown/devlop) que o Jest
// não transforma — mockamos como componentes simples para testar só o gating.
jest.mock('@/components/agents/pesquisador/PesquisadorAgent', () => ({
  PesquisadorAgent: function PesquisadorAgent() {
    return null
  },
}))
jest.mock('@/components/agents/lumen/LumenAgent', () => ({
  LumenAgent: function LumenAgent() {
    return null
  },
}))

import ToolPage from '@/app/tools/[slug]/page'
import { LockedToolShell } from '@/components/tools/LockedToolShell'
import { LumenAgent } from '@/components/agents/lumen/LumenAgent'
import { PesquisadorAgent } from '@/components/agents/pesquisador/PesquisadorAgent'

describe('ToolPage — gating de permissão (Better Auth + tool_permissions)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('tool com requiresAuth e hasToolPermission=false renderiza LockedToolShell', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockHasToolPermission.mockResolvedValue(false)

    const result = await ToolPage({ params: { slug: 'lumen' } })

    expect(mockHasToolPermission).toHaveBeenCalledWith('user-1', 'lumen')
    expect(result.type).toBe(LockedToolShell)
    expect(result.props.toolName).toBe('LUMEN')
  })

  it('tool com requiresAuth e hasToolPermission=true renderiza a tool', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockHasToolPermission.mockResolvedValue(true)

    const result = await ToolPage({ params: { slug: 'lumen' } })

    expect(result.type).toBe(LumenAgent)
  })

  it('sem sessão, não chama hasToolPermission e renderiza LockedToolShell', async () => {
    mockGetSession.mockResolvedValue(null)

    const result = await ToolPage({ params: { slug: 'lumen' } })

    expect(mockHasToolPermission).not.toHaveBeenCalled()
    expect(result.type).toBe(LockedToolShell)
  })

  it('tool sem requiresAuth renderiza sem checar permissão', async () => {
    const result = await ToolPage({ params: { slug: 'pesquisador' } })

    expect(mockGetSession).not.toHaveBeenCalled()
    expect(mockHasToolPermission).not.toHaveBeenCalled()
    expect(result.type).toBe(PesquisadorAgent)
  })
})
