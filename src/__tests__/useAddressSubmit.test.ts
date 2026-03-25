import { renderHook, act } from '@testing-library/react'
import { useAddressSubmit } from '@/hooks/useAddressSubmit'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useAddressSubmit', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('status inicial é "idle"', () => {
    const { result } = renderHook(() => useAddressSubmit('/api/jobs'))
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })

  it('submit faz POST para ${baseEndpoint}/${jobId}/address com body { address }', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    const { result } = renderHook(() => useAddressSubmit('/api/jobs'))
    await act(async () => {
      await result.current.submit('job-1', 'Rua das Flores, 100')
    })
    expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-1/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: 'Rua das Flores, 100' }),
    })
  })

  it('submit bem-sucedido (200) retorna status para "idle"', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    const { result } = renderHook(() => useAddressSubmit('/api/jobs'))
    await act(async () => { await result.current.submit('job-2', 'Av. Paulista, 1000') })
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })

  it('status 409 define error="Job não está aguardando endereço."', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 409, json: async () => ({}) })
    const { result } = renderHook(() => useAddressSubmit('/api/jobs'))
    await act(async () => { await result.current.submit('job-3', 'Rua X') })
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Job não está aguardando endereço.')
  })

  it('status 401 define error="Sessão expirada. Faça login novamente."', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) })
    const { result } = renderHook(() => useAddressSubmit('/api/jobs'))
    await act(async () => { await result.current.submit('job-4', 'Rua Y') })
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Sessão expirada. Faça login novamente.')
  })

  it('erro de rede define error com mensagem de erro', async () => {
    mockFetch.mockRejectedValue(new TypeError('Network error'))
    const { result } = renderHook(() => useAddressSubmit('/api/jobs'))
    await act(async () => { await result.current.submit('job-5', 'Rua Z') })
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Network error')
  })

  it('reset() limpa error e volta status para idle', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 409, json: async () => ({}) })
    const { result } = renderHook(() => useAddressSubmit('/api/jobs'))
    await act(async () => { await result.current.submit('job-6', 'Rua W') })
    expect(result.current.status).toBe('error')
    act(() => { result.current.reset() })
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })
})
