import { renderHook, act } from '@testing-library/react'
import { useJobCreate } from '@/hooks/useJobCreate'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useJobCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('estado inicial: jobId=null, status="idle", error=null', () => {
    const { result } = renderHook(() => useJobCreate('/api/test'))
    expect(result.current.jobId).toBeNull()
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })

  it('createJob chama fetch com método POST para o endpoint fornecido', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'job-123' }),
    })
    const { result } = renderHook(() => useJobCreate('/api/agents/pesquisador/jobs'))
    const formData = new FormData()
    await act(async () => {
      await result.current.createJob(formData)
    })
    expect(mockFetch).toHaveBeenCalledWith('/api/agents/pesquisador/jobs', {
      method: 'POST',
      body: formData,
    })
  })

  it('createJob com FormData envia multipart/form-data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'job-456' }),
    })
    const { result } = renderHook(() => useJobCreate('/api/test'))
    const formData = new FormData()
    formData.append('file', new Blob(['content'], { type: 'application/pdf' }), 'test.pdf')
    await act(async () => {
      await result.current.createJob(formData)
    })
    const callArgs = mockFetch.mock.calls[0]
    expect(callArgs[1].body).toBeInstanceOf(FormData)
  })

  it('após sucesso: jobId recebe o id retornado pela API, status="idle"', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'job-789' }),
    })
    const { result } = renderHook(() => useJobCreate('/api/test'))
    await act(async () => {
      await result.current.createJob(new FormData())
    })
    expect(result.current.jobId).toBe('job-789')
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })

  it('após erro HTTP (4xx/5xx): status="error", error contém mensagem', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
    })
    const { result } = renderHook(() => useJobCreate('/api/test'))
    await act(async () => {
      await result.current.createJob(new FormData())
    })
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('HTTP 422')
    expect(result.current.jobId).toBeNull()
  })

  it('após erro de rede: status="error", error="Erro ao criar job"', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const { result } = renderHook(() => useJobCreate('/api/test'))
    await act(async () => {
      await result.current.createJob(new FormData())
    })
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Failed to fetch')
  })

  it('durante criação: status="creating"', async () => {
    let resolveFetch!: (value: unknown) => void
    const pendingFetch = new Promise((resolve) => { resolveFetch = resolve })
    mockFetch.mockReturnValueOnce(pendingFetch)

    const { result } = renderHook(() => useJobCreate('/api/test'))

    act(() => {
      result.current.createJob(new FormData())
    })

    expect(result.current.status).toBe('creating')

    await act(async () => {
      resolveFetch({ ok: true, json: async () => ({ id: 'job-001' }) })
      await pendingFetch
    })
  })

  it('reset() restaura jobId=null, status="idle", error=null', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'job-reset' }),
    })
    const { result } = renderHook(() => useJobCreate('/api/test'))
    await act(async () => {
      await result.current.createJob(new FormData())
    })
    expect(result.current.jobId).toBe('job-reset')

    act(() => {
      result.current.reset()
    })
    expect(result.current.jobId).toBeNull()
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })
})
