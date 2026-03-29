import { render, screen } from '@testing-library/react'
import { LeadScoreBadge } from '../LeadScoreBadge'

describe('LeadScoreBadge', () => {
  describe('LUMEN-07: score badge color thresholds', () => {
    it('score >= 70 renderiza classes bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', () => {
      render(<LeadScoreBadge score={85} />)
      const badge = screen.getByLabelText('Score: 85')
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-700')
    })

    it('score entre 40 e 69 renderiza classes bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', () => {
      render(<LeadScoreBadge score={55} />)
      const badge = screen.getByLabelText('Score: 55')
      expect(badge).toHaveClass('bg-yellow-100')
      expect(badge).toHaveClass('text-yellow-700')
    })

    it('score < 40 renderiza classes bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', () => {
      render(<LeadScoreBadge score={20} />)
      const badge = screen.getByLabelText('Score: 20')
      expect(badge).toHaveClass('bg-red-100')
      expect(badge).toHaveClass('text-red-700')
    })

    it('renderiza o valor numérico do score como texto visível', () => {
      render(<LeadScoreBadge score={85} />)
      const badge = screen.getByLabelText('Score: 85')
      expect(badge).toHaveTextContent('85')
    })

    it('tem aria-label="Score: {score}" para acessibilidade', () => {
      render(<LeadScoreBadge score={42} />)
      expect(screen.getByLabelText('Score: 42')).toBeInTheDocument()
    })

    it('score=70 (boundary) usa classes verdes', () => {
      render(<LeadScoreBadge score={70} />)
      const badge = screen.getByLabelText('Score: 70')
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-700')
    })

    it('score=40 (boundary) usa classes amarelas', () => {
      render(<LeadScoreBadge score={40} />)
      const badge = screen.getByLabelText('Score: 40')
      expect(badge).toHaveClass('bg-yellow-100')
      expect(badge).toHaveClass('text-yellow-700')
    })

    it('score=39 (boundary) usa classes vermelhas', () => {
      render(<LeadScoreBadge score={39} />)
      const badge = screen.getByLabelText('Score: 39')
      expect(badge).toHaveClass('bg-red-100')
      expect(badge).toHaveClass('text-red-700')
    })
  })
})
