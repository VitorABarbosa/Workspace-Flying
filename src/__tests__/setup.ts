import '@testing-library/jest-dom'
import React from 'react'
// As globais de fetch (Request/Response/Headers/fetch/ReadableStream), exigidas
// pelo cliente do Better Auth (auth-client.ts) no import, são providas pelo
// testEnvironment `jest-fixed-jsdom` (ver jest.config.ts).

interface MotionDivProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  'data-testid'?: string
}

interface MotionAsideProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  role?: string
  'aria-modal'?: boolean | 'true' | 'false'
  'aria-label'?: string
}

interface MotionButtonProps {
  children?: React.ReactNode
  className?: string
  onClick?: () => void
  'aria-label'?: string
}

interface WithChildrenProps {
  children?: React.ReactNode
}

interface MockLinkProps {
  children?: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
}

// Mock framer-motion — AnimatePresence e motion.* não funcionam no jsdom
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, onClick, 'data-testid': testId }: MotionDivProps) =>
      React.createElement('div', { className, style, onClick, 'data-testid': testId }, children),
    aside: ({ children, className, style, role, 'aria-modal': ariaModal, 'aria-label': ariaLabel }: MotionAsideProps) =>
      React.createElement('aside', { className, style, role, 'aria-modal': ariaModal, 'aria-label': ariaLabel }, children),
    button: ({ children, className, onClick, 'aria-label': ariaLabel }: MotionButtonProps) =>
      React.createElement('button', { className, onClick, 'aria-label': ariaLabel }, children),
  },
  AnimatePresence: ({ children }: WithChildrenProps) => React.createElement(React.Fragment, null, children),
  useReducedMotion: () => false,
}))

// Mock next-themes — useTheme retorna undefined durante SSR no jsdom
// setTheme deve ser instância única para ser rastreável nos testes
const mockSetTheme = jest.fn()
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: mockSetTheme }),
  ThemeProvider: ({ children }: WithChildrenProps) => React.createElement(React.Fragment, null, children),
}))

// Mock next/link — substitui <Link> por <a> para testes
jest.mock('next/link', () => {
  return function MockLink({ children, href, onClick, className }: MockLinkProps) {
    return React.createElement('a', { href, onClick, className }, children)
  }
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
}))

// Mock window.scrollTo (guarded: alguns testes de integração usam @jest-environment node,
// onde window não existe)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
  })
}
