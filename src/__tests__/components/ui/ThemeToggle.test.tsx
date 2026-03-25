import { render, screen, fireEvent } from '@testing-library/react'
import { useTheme } from 'next-themes'
import ThemeToggle from '@/components/ui/ThemeToggle'

describe('ThemeToggle', () => {
  it('renderiza botão com aria-label "Alternar tema"', () => {
    render(<ThemeToggle />)
    expect(screen.getByLabelText('Alternar tema')).toBeInTheDocument()
  })

  it('chama setTheme com "dark" quando tema atual é "light"', () => {
    const { setTheme } = useTheme()
    render(<ThemeToggle />)
    fireEvent.click(screen.getByLabelText('Alternar tema'))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
