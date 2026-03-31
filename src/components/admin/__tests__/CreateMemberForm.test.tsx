import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockCreateMember = jest.fn()
jest.mock('@/app/admin/actions', () => ({
  createMember: (...args: unknown[]) => mockCreateMember(...args),
}))
jest.mock('@/config/tools', () => ({
  tools: [
    { id: 'pesquisador', name: 'Pesquisador', status: 'active', areas: [] },
    { id: 'lumen', name: 'LUMEN', status: 'active', areas: [] },
  ],
}))

import { CreateMemberForm } from '../CreateMemberForm'

describe('CreateMemberForm — criação de membro (PERM-08)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateMember.mockResolvedValue({})
  })

  it('renderiza campos: nome, email, senha, role e ferramentas', () => {
    render(<CreateMemberForm />)
    expect(screen.getByRole('textbox', { name: /nome/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pesquisador/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lumen/i)).toBeInTheDocument()
  })

  it('checkboxes de ferramenta refletem as ferramentas disponíveis em tools.ts', () => {
    render(<CreateMemberForm />)
    expect(screen.getByLabelText(/pesquisador/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lumen/i)).toBeInTheDocument()
  })

  it('submeter formulário chama createMember com nome, email, senha, role e ferramentas', async () => {
    render(<CreateMemberForm />)
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByLabelText(/lumen/i))
    fireEvent.submit(screen.getByRole('button', { name: /criar membro/i }).closest('form')!)
    await waitFor(() => {
      expect(mockCreateMember).toHaveBeenCalledWith('Ana', 'ana@test.com', 'pass123', 'member', ['lumen'])
    })
  })

  it('exibe erro inline se createMember retorna error', async () => {
    mockCreateMember.mockResolvedValue({ error: 'Email already registered' })
    render(<CreateMemberForm />)
    fireEvent.submit(screen.getByRole('button', { name: /criar membro/i }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already registered')
    })
  })

  it('limpa o formulário após criação bem-sucedida', async () => {
    render(<CreateMemberForm />)
    const nameInput = screen.getByLabelText(/nome/i)
    fireEvent.change(nameInput, { target: { value: 'Ana' } })
    fireEvent.submit(screen.getByRole('button', { name: /criar membro/i }).closest('form')!)
    await waitFor(() => {
      expect(nameInput).toHaveValue('')
    })
  })
})
