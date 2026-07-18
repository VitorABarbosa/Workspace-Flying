import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/app/login/LoginForm'

const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), refresh: mockRefresh }),
  usePathname: () => '/',
}))

const mockSignInEmail = jest.fn()
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: { email: (...args: unknown[]) => mockSignInEmail(...args) },
  },
}))

describe('LoginPage — formulário de login individual (AUTH-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza heading "Acesso restrito"', () => {
    render(<LoginForm />)
    expect(screen.getByText('Acesso restrito')).toBeInTheDocument()
  })

  it('renderiza campo de e-mail e senha', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    const input = screen.getByLabelText('Senha de acesso')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renderiza botão "Entrar"', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /^Entrar$/i })).toBeInTheDocument()
  })

  it('não renderiza toggle de conta de equipe', () => {
    render(<LoginForm />)
    expect(screen.queryByRole('button', { name: /conta individual/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /senha da equipe/i })).not.toBeInTheDocument()
  })

  it('campo de e-mail tem autoFocus', () => {
    render(<LoginForm />)
    const input = screen.getByLabelText('E-mail')
    expect(document.activeElement).toBe(input)
  })

  it('mostra "Entrando..." e desabilita botão durante loading', async () => {
    mockSignInEmail.mockImplementation(
      () => new Promise(() => {}) // pendente indefinidamente
    )
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Senha de acesso'), 'senha123')
    fireEvent.click(screen.getByRole('button', { name: /^Entrar$/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Entrando/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Entrando/i })).toHaveTextContent(/Entrando/)
    })
  })

  it('exibe mensagem de erro com role="alert" quando login falha', async () => {
    mockSignInEmail.mockResolvedValue({
      error: { message: 'Invalid login credentials', status: 400 },
    })
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Senha de acesso'), 'senhaerrada')
    fireEvent.click(screen.getByRole('button', { name: /entrar$/i }))
    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Email ou senha inválidos')
    })
  })

  it('chama authClient.signIn.email com email e senha, depois router.push("/") e router.refresh()', async () => {
    mockSignInEmail.mockResolvedValue({ error: null })
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Senha de acesso'), 'senhaCorreta')
    fireEvent.click(screen.getByRole('button', { name: /entrar$/i }))
    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'senhaCorreta',
      })
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})
