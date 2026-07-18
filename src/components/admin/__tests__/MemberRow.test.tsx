import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockDisableMember = jest.fn()
const mockReactivateMember = jest.fn()
const mockDeleteMember = jest.fn()
const mockResetPassword = jest.fn()

jest.mock('@/app/admin/actions', () => ({
  disableMember: (id: string) => mockDisableMember(id),
  reactivateMember: (id: string) => mockReactivateMember(id),
  deleteMember: (id: string) => mockDeleteMember(id),
  resetPassword: (id: string, pw: string) => mockResetPassword(id, pw),
}))
jest.mock('../EditPermissionsForm', () => ({
  EditPermissionsForm: () => <tr><td>edit form</td></tr>,
}))

import { MemberRow } from '../MemberRow'
import type { Member } from '../MemberList'

const activeMember: Member = {
  id: 'user-1',
  name: 'Ana Lima',
  email: 'ana@test.com',
  role: 'member',
  tools: ['lumen'],
  bannedUntil: undefined,
}
const bannedMember: Member = { ...activeMember, bannedUntil: '2126-01-01T00:00:00Z' }

describe('MemberRow — ações de membro (PERM-10)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDisableMember.mockResolvedValue({})
    mockReactivateMember.mockResolvedValue({})
    mockDeleteMember.mockResolvedValue({})
    mockResetPassword.mockResolvedValue({})
  })

  it('renderiza botão "Desativar" para membro ativo', () => {
    render(<table><tbody><MemberRow member={activeMember} /></tbody></table>)
    expect(screen.getByRole('button', { name: /desativar/i })).toBeInTheDocument()
  })

  it('clicar em "Desativar" chama disableMember com userId do membro', async () => {
    render(<table><tbody><MemberRow member={activeMember} /></tbody></table>)
    fireEvent.click(screen.getByRole('button', { name: /desativar/i }))
    await waitFor(() => {
      expect(mockDisableMember).toHaveBeenCalledWith('user-1')
    })
  })

  it('renderiza botão "Reativar" para membro com banned_until preenchido', () => {
    render(<table><tbody><MemberRow member={bannedMember} /></tbody></table>)
    expect(screen.getByRole('button', { name: /reativar/i })).toBeInTheDocument()
  })

  it('renderiza botão "Remover" que requer confirmação', () => {
    render(<table><tbody><MemberRow member={activeMember} /></tbody></table>)
    expect(screen.getByRole('button', { name: /remover/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /confirmar remoção/i })).not.toBeInTheDocument()
  })

  it('confirmar remoção chama deleteMember com userId do membro', async () => {
    render(<table><tbody><MemberRow member={activeMember} /></tbody></table>)
    fireEvent.click(screen.getByRole('button', { name: /remover/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirmar remoção/i }))
    await waitFor(() => {
      expect(mockDeleteMember).toHaveBeenCalledWith('user-1')
    })
  })

  it('cancelar confirmação não chama deleteMember', () => {
    render(<table><tbody><MemberRow member={activeMember} /></tbody></table>)
    fireEvent.click(screen.getByRole('button', { name: /remover/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(mockDeleteMember).not.toHaveBeenCalled()
  })

  it('renderiza botão "Redefinir senha"', () => {
    render(<table><tbody><MemberRow member={activeMember} /></tbody></table>)
    expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeInTheDocument()
  })

  it('redefinir senha chama resetPassword com userId e a nova senha', async () => {
    render(<table><tbody><MemberRow member={activeMember} /></tbody></table>)
    fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }))
    fireEvent.change(screen.getByLabelText(/nova senha/i), { target: { value: 'nova-senha-123' } })
    fireEvent.click(screen.getByRole('button', { name: /salvar senha/i }))
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('user-1', 'nova-senha-123')
    })
  })
})
