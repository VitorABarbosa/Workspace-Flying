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
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
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
    expect(screen.getByRole('button', { name: /^Entrar$/i })).toBeInTheDocument()
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
    const button = screen.getByRole('button', { name: /^Entrar$/i })
    await userEvent.type(input, 'senha123')
    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Entrando/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Entrando/i })).toHaveTextContent(/Entrando/)
    })
  })

  it('exibe mensagem de erro com role="alert" quando signInWithPassword falha', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials', status: 400 },
    })
    render(<LoginForm />)
    const input = screen.getByLabelText('Senha de acesso')
    await userEvent.type(input, 'senhaerrada')
    fireEvent.click(screen.getByRole('button', { name: /entrar$/i }))
    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Senha incorreta. Tente novamente.')
    })
  })

  it('chama router.push("/tools") e router.refresh() após login com sucesso', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    render(<LoginForm />)
    const input = screen.getByLabelText('Senha de acesso')
    await userEvent.type(input, 'senhaCorreta')
    fireEvent.click(screen.getByRole('button', { name: /entrar$/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/tools')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})

describe('LoginForm — individual account toggle (PERM-02, PERM-03)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignInWithPassword.mockResolvedValue({ error: null })
  })

  it('team mode is the default — only password field visible, email field not rendered', () => {
    render(<LoginForm />)
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Senha de acesso')).toBeInTheDocument()
  })

  it('team mode uses TEAM_EMAIL (team@flyingstudio.com.br) constant in signInWithPassword call', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText('Senha de acesso'), 'somepassword')
    await userEvent.click(screen.getByRole('button', { name: /entrar$/i }))
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'team@flyingstudio.com.br',
      password: 'somepassword',
    })
  })

  it('clicking "Entrar com conta individual" toggles to individual mode', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar com conta individual' }))
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('individual mode renders email field with type="email" and aria-label="E-mail"', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar com conta individual' }))
    const emailField = screen.getByLabelText('E-mail')
    expect(emailField).toHaveAttribute('type', 'email')
  })

  it('individual mode subheading changes to "Digite seu e-mail e senha para continuar"', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar com conta individual' }))
    expect(screen.getByText('Digite seu e-mail e senha para continuar')).toBeInTheDocument()
  })

  it('individual mode uses user-supplied email (not TEAM_EMAIL) in signInWithPassword call', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar com conta individual' }))
    await userEvent.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Senha de acesso'), 'mypassword')
    await userEvent.click(screen.getByRole('button', { name: /entrar$/i }))
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'mypassword',
    })
    expect(mockSignInWithPassword).not.toHaveBeenCalledWith(
      expect.objectContaining({ email: 'team@flyingstudio.com.br' })
    )
  })

  it('clicking "Usar senha da equipe" returns to team mode — email field hidden again', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar com conta individual' }))
    await userEvent.click(screen.getByRole('button', { name: 'Usar senha da equipe' }))
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument()
  })

  it('individual mode error shows "E-mail ou senha incorretos. Tente novamente."', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar com conta individual' }))
    await userEvent.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('Senha de acesso'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /entrar$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos. Tente novamente.')
  })

  it('team mode error shows "Senha incorreta. Tente novamente."', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText('Senha de acesso'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /entrar$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Senha incorreta. Tente novamente.')
  })
})
