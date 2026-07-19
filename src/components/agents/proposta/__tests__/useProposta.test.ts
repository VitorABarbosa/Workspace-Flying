import { act, renderHook } from '@testing-library/react'
import { useProposta } from '../useProposta'

const LEVANTAMENTO = {
  estrutura: { cliente: { empresa: 'GALLI', ref: 'Aurora', contato: '—' } },
  fechado: { financeiro: { total: 3000 } },
  estrategia_usada: 'planilha',
  avisos: [],
  pendencias: [],
}

describe('useProposta', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('levantarPorTexto popula levantamento', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => LEVANTAMENTO,
    })
    const { result } = renderHook(() => useProposta())
    await act(() => result.current.levantarPorTexto('cliente GALLI'))
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tools/proposta/levantamento',
      expect.objectContaining({ method: 'POST' })
    )
    expect(result.current.levantamento?.estrategia_usada).toBe('planilha')
    expect(result.current.erro).toBeNull()
  })

  it('erro HTTP vira mensagem e não quebra', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'sem token',
    })
    const { result } = renderHook(() => useProposta())
    await act(() => result.current.levantarPorTexto('x'))
    expect(result.current.erro).toContain('503')
    expect(result.current.levantamento).toBeNull()
  })

  it('gerar popula gerada e reiniciar limpa tudo', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ proposta_id: 7, download: '/propostas/7/docx', docx_url: null, avisos: [] }),
    })
    const { result } = renderHook(() => useProposta())
    await act(() => result.current.gerar({} as never))
    expect(result.current.gerada?.proposta_id).toBe(7)
    act(() => result.current.reiniciar())
    expect(result.current.gerada).toBeNull()
  })
})
