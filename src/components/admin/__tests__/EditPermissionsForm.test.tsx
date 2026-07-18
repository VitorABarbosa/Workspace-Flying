import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockUpdatePermissions = jest.fn()
jest.mock('@/app/admin/actions', () => ({
  updatePermissions: (...args: unknown[]) => mockUpdatePermissions(...args),
}))
jest.mock('@/config/tools', () => ({
  tools: [
    { id: 'pesquisador', name: 'Pesquisador', status: 'active', areas: [] },
    { id: 'lumen', name: 'LUMEN', status: 'active', areas: [] },
  ],
}))

import { EditPermissionsForm } from '../EditPermissionsForm'
import type { Member } from '../MemberList'

const baseMember: Member = {
  id: 'user-1',
  name: 'Ana Lima',
  email: 'ana@test.com',
  role: 'member',
  tools: ['lumen'],
}

describe('EditPermissionsForm — edição de permissões (PERM-09)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdatePermissions.mockResolvedValue({})
  })

  it('renderiza um checkbox por ferramenta em tools.ts', () => {
    render(<EditPermissionsForm member={baseMember} onClose={jest.fn()} />)
    expect(screen.getByLabelText(/pesquisador/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lumen/i)).toBeInTheDocument()
  })

  it('checkboxes pré-marcados refletem as ferramentas já autorizadas do membro', () => {
    render(<EditPermissionsForm member={baseMember} onClose={jest.fn()} />)
    expect(screen.getByLabelText(/lumen/i)).toBeChecked()
    expect(screen.getByLabelText(/pesquisador/i)).not.toBeChecked()
  })

  it('submeter chama updatePermissions com userId e slugs marcados', async () => {
    render(<EditPermissionsForm member={baseMember} onClose={jest.fn()} />)
    fireEvent.submit(screen.getByRole('button', { name: /salvar/i }).closest('form')!)
    await waitFor(() => {
      expect(mockUpdatePermissions).toHaveBeenCalledWith('user-1', ['lumen'], 'member')
    })
  })

  it('submeter com nenhuma ferramenta marcada chama updatePermissions com array vazio', async () => {
    render(<EditPermissionsForm member={{ ...baseMember, tools: [] }} onClose={jest.fn()} />)
    fireEvent.submit(screen.getByRole('button', { name: /salvar/i }).closest('form')!)
    await waitFor(() => {
      expect(mockUpdatePermissions).toHaveBeenCalledWith('user-1', [], 'member')
    })
  })

  it('role select pré-selecionado com role atual do membro', () => {
    render(<EditPermissionsForm member={baseMember} onClose={jest.fn()} />)
    expect(screen.getByLabelText(/role/i)).toHaveValue('member')
  })

  it('submeter atualiza role via updatePermissions', async () => {
    render(<EditPermissionsForm member={baseMember} onClose={jest.fn()} />)
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'admin' } })
    fireEvent.submit(screen.getByRole('button', { name: /salvar/i }).closest('form')!)
    await waitFor(() => {
      expect(mockUpdatePermissions).toHaveBeenCalledWith('user-1', ['lumen'], 'admin')
    })
  })
})
