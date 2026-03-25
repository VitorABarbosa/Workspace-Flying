import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/app/login/LoginForm'

const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), refresh: mockRefresh }),
  usePathname: () => '/',
}))

const mockSignInWithPassword = jest.fn()
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignInWithPassword },
  }),
}))

describe('LoginPage — formulário de senha compartilhada (AUTH-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza heading "Acesso restrito"', () => {
    render(<LoginForm />)
    expect(screen.getByText('Acesso restrito')).toBeInTheDocument()
  })

  it('renderiza campo de senha com type="password"', () => {
    render(<LoginForm />)
    const input = screen.getByLabelText('Senha de acesso')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renderiza botão "Entrar"', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('campo de senha tem autoFocus', () => {
    render(<LoginForm />)
    const input = screen.getByLabelText('Senha de acesso')
    // React sets autoFocus as a DOM property, not an HTML attribute — check via document.activeElement
    expect(document.activeElement).toBe(input)
  })

  it('mostra "Entrando..." e desabilita botão durante loading', async () => {
    mockSignInWithPassword.mockImplementation(
      () => new Promise(() => {}) // pendente indefinidamente
    )
    render(<LoginForm />)
    const input = screen.getByLabelText('Senha de acesso')
    const button = screen.getByRole('button', { name: /entrar/i })
    await userEvent.type(input, 'senha123')
    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByRole('button')).toHaveTextContent(/Entrando/)
    })
  })

  it('exibe mensagem de erro com role="alert" quando signInWithPassword falha', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials', status: 400 },
    })
    render(<LoginForm />)
    const input = screen.getByLabelText('Senha de acesso')
    await userEvent.type(input, 'senhaerrada')
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Senha incorreta. Tente novamente.')
    })
  })

  it('chama router.push("/") e router.refresh() após login com sucesso', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    render(<LoginForm />)
    const input = screen.getByLabelText('Senha de acesso')
    await userEvent.type(input, 'senhaCorreta')
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})
