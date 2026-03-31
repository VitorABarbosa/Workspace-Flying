// src/components/tools/__tests__/LockedToolShell.test.tsx
import { render, screen } from '@testing-library/react'
import { LockedToolShell } from '../LockedToolShell'

jest.mock('@/components/tools/AgentShell', () => ({
  AgentShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="agent-shell">{children}</div>
  ),
}))

describe('LockedToolShell', () => {
  it.todo('renders inside AgentShell wrapper')
  it.todo('displays "Acesso restrito" heading')
  it.todo('displays "Você não tem acesso a esta ferramenta. Contate o administrador." body text')
  it.todo('renders LockKeyhole icon with aria-hidden="true"')
  it.todo('heading is an h2 element')
})
