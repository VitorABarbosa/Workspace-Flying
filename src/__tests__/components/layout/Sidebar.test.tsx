import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '@/components/layout/Sidebar'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: null }),
    signOut: () => Promise.resolve({}),
  },
}))

const mockOnClose = jest.fn()

describe('Sidebar', () => {
  beforeEach(() => mockOnClose.mockClear())

  it('não renderiza quando isOpen é false', () => {
    render(<Sidebar isOpen={false} onClose={mockOnClose} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza drawer quando isOpen é true', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renderiza o link de navegação Home', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('DNA Flying Studio')).not.toBeInTheDocument()
    expect(screen.queryByText('Solicitar Orçamento')).not.toBeInTheDocument()
  })

  it('chama onClose ao clicar no overlay', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />)
    const overlay = screen.getByTestId('overlay')
    fireEvent.click(overlay)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao clicar em um link de nav', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />)
    fireEvent.click(screen.getByText('Home'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao pressionar ESC', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
