import { renderHook, act } from '@testing-library/react'
import { useJobPolling } from '@/hooks/useJobPolling'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useJobPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('nao inicia polling quando jobId=null', () => {
    renderHook(() => useJobPolling(null, '/api/jobs'))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('inicia polling imediato (sem aguardar primeiro intervalo) quando jobId e definido', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'job-1', state: 'processing' }),
    })
    renderHook(() => useJobPolling('job-1', '/api/jobs', 5000))
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-1')
  })

  it('faz fetch para `${pollEndpoint}/${jobId}` a cada intervalMs ms', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'job-2', state: 'processing' }),
    })
    renderHook(() => useJobPolling('job-2', '/api/jobs', 1000))
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    await act(async () => {
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(2)
    await act(async () => {
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('atualiza jobStatus com os campos do payload retornado pela API', async () => {
    const payload = {
      id: 'job-3',
      state: 'processing',
      progress: 'Analisando...',
      requires_address: true,
      address_prompt: 'Informe o endereco completo para continuar.',
    }
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    })
    const { result } = renderHook(() => useJobPolling('job-3', '/api/jobs', 1000))
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.jobStatus).toEqual(payload)
  })

  it('para o polling quando state="completed" (nao dispara mais fetches)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'job-4', state: 'completed', result: { markdown: '# Done' } }),
    })
    renderHook(() => useJobPolling('job-4', '/api/jobs', 1000))
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    await act(async () => {
      jest.advanceTimersByTime(3000)
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('para o polling quando state="failed" e define error com data.error', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'job-5', state: 'failed', error: 'Documento invalido' }),
    })
    const { result } = renderHook(() => useJobPolling('job-5', '/api/jobs', 1000))
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.error).toBe('Documento invalido')
    await act(async () => {
      jest.advanceTimersByTime(3000)
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('tolera falha transitória e só encerra após MAX_CONSECUTIVE_FAILURES falhas seguidas', async () => {
    mockFetch.mockRejectedValue(new TypeError('Network error'))
    const { result } = renderHook(() => useJobPolling('job-6', '/api/jobs', 1000))
    // 1ª falha (poll imediato): NÃO encerra, ainda sem erro
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.error).toBeNull()
    expect(mockFetch).toHaveBeenCalledTimes(1)
    // polls 2, 3, 4 — na 4ª falha consecutiva declara erro e encerra
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })
    }
    expect(mockFetch).toHaveBeenCalledTimes(4)
    expect(result.current.error).toBe('Falha ao verificar status')
    // já terminal: não faz mais fetch
    await act(async () => {
      jest.advanceTimersByTime(3000)
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(4)
  })

  it('recupera de falha transitória: um sucesso zera o contador e limpa o erro', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('blip'))
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'job-r', state: 'processing' }),
      })
    const { result } = renderHook(() => useJobPolling('job-r', '/api/jobs', 1000))
    // 1ª falha transitória: sem erro, segue tentando
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.error).toBeNull()
    // próximo poll tem sucesso → atualiza status e mantém erro limpo
    await act(async () => {
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
    })
    expect(result.current.jobStatus?.state).toBe('processing')
    expect(result.current.error).toBeNull()
  })

  it('limpa o setInterval no cleanup do useEffect (sem memory leak)', async () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'job-7', state: 'processing' }),
    })
    const { unmount } = renderHook(() => useJobPolling('job-7', '/api/jobs', 1000))
    await act(async () => {
      await Promise.resolve()
    })
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('redefine isTerminal para false quando jobId muda', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 'job-8a', state: 'completed' }),
    })
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'job-8b', state: 'processing' }),
    })
    const jobId = 'job-8a'
    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useJobPolling(id, '/api/jobs', 1000),
      { initialProps: { id: jobId } }
    )
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.jobStatus?.state).toBe('completed')

    await act(async () => {
      rerender({ id: 'job-8b' })
      await Promise.resolve()
    })
    expect(result.current.jobStatus?.state).toBe('processing')
  })

  it('trata 401 como terminal e define error="Sessao expirada..."', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    })
    const { result } = renderHook(() => useJobPolling('job-9', '/api/jobs', 1000))
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.error).toBe('Sessão expirada. Faça login novamente.')
    await act(async () => {
      jest.advanceTimersByTime(3000)
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('para o polling quando state="cancelled" (nao dispara mais fetches)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'job-cancel', state: 'cancelled', leads_saved: 3 }),
    })
    renderHook(() => useJobPolling('job-cancel', '/api/lumen/status', 1000))
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    await act(async () => {
      jest.advanceTimersByTime(3000)
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('encaminha campos LUMEN (progress_pct, found, new, duplicates, leads_saved) no jobStatus', async () => {
    const payload = {
      id: 'job-lumen',
      state: 'processing',
      progress_pct: 42,
      found: 10,
      new: 7,
      duplicates: 3,
      leads_saved: 0,
    }
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    })
    const { result } = renderHook(() => useJobPolling('job-lumen', '/api/lumen/status', 1000))
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.jobStatus?.progress_pct).toBe(42)
    expect(result.current.jobStatus?.found).toBe(10)
    expect(result.current.jobStatus?.new).toBe(7)
    expect(result.current.jobStatus?.duplicates).toBe(3)
    expect(result.current.jobStatus?.leads_saved).toBe(0)
  })
})
