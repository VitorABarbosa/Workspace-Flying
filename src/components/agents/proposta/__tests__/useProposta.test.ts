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

  it('levantarPorTexto manda a empresa escolhida', async () => {
    // O texto livre não diz de qual das três é a proposta.
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => LEVANTAMENTO })
    const { result } = renderHook(() => useProposta())
    await act(() => result.current.levantarPorTexto('filme conceito pra OUSY', 'rinno'))
    const [, opcoes] = (global.fetch as jest.Mock).mock.calls[0]
    expect(JSON.parse(opcoes.body)).toEqual({ texto: 'filme conceito pra OUSY', emissor: 'rinno' })
  })

  it('erro HTTP vira frase de gente, não número de status', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'sem token',
    })
    const { result } = renderHook(() => useProposta())
    await act(() => result.current.levantarPorTexto('x'))
    expect(result.current.erro).toBe(
      'O serviço de propostas está indisponível agora. Tente de novo em alguns minutos.'
    )
    expect(result.current.levantamento).toBeNull()
  })

  it('quando a API explica o motivo, é o motivo que aparece', async () => {
    // A API manda o porquê em `detail`; antes a tela cuspia o JSON cru.
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => JSON.stringify({
        detail: "O banco está atrás do código (falta coluna ou tabela). Rode 'python -m scripts.migrar_catalogo_2026'.",
      }),
    })
    const { result } = renderHook(() => useProposta())
    await act(() => result.current.levantarPorTexto('x'))
    expect(result.current.erro).toContain('banco está atrás do código')
    expect(result.current.erro).not.toContain('{')
  })

  it('erro 500 sem corpo aponta para onde olhar', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })
    const { result } = renderHook(() => useProposta())
    await act(() => result.current.levantarPorTexto('x'))
    expect(result.current.erro).toContain('/saude')
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
