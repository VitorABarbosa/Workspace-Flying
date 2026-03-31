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

describe('LoginForm — individual account toggle (PERM-02, PERM-03)', () => {
  it.todo('team mode is the default — only password field visible, email field not rendered')
  it.todo('team mode uses TEAM_EMAIL (team@flyingstudio.com.br) constant in signInWithPassword call')
  it.todo('clicking "Entrar com conta individual" toggles to individual mode')
  it.todo('individual mode renders email field with type="email" and aria-label="E-mail"')
  it.todo('individual mode subheading changes to "Digite seu e-mail e senha para continuar"')
  it.todo('individual mode uses user-supplied email (not TEAM_EMAIL) in signInWithPassword call')
  it.todo('clicking "Usar senha da equipe" returns to team mode — email field hidden again')
  it.todo('individual mode error shows "E-mail ou senha incorretos. Tente novamente."')
  it.todo('team mode error shows "Senha incorreta. Tente novamente."')
})
