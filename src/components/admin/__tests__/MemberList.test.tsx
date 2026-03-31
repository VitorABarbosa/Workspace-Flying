import React from 'react'
import { render, screen } from '@testing-library/react'

// MemberRow is simple — render inline for isolation
jest.mock('../MemberRow', () => ({
  MemberRow: ({ member }: { member: { id: string; name: string; email: string; role: string; tools: string[]; bannedUntil?: string } }) => (
    <tr data-testid={`member-row-${member.id}`}>
      <td>{member.name}</td>
      <td>{member.email}</td>
      <td>{member.role}{member.bannedUntil ? ' Desativado' : ''}</td>
      <td>{member.tools.join(', ')}</td>
    </tr>
  ),
}))

import { MemberList } from '../MemberList'
import type { Member } from '../MemberList'

const baseMember: Member = {
  id: 'user-1',
  name: 'Ana Lima',
  email: 'ana@flyingstudio.com.br',
  role: 'member',
  tools: ['lumen'],
  bannedUntil: undefined,
}

describe('MemberList — renderização da lista de membros (PERM-07)', () => {
  it('renderiza uma linha por membro passado como prop', () => {
    const members: Member[] = [
      baseMember,
      { ...baseMember, id: 'user-2', name: 'Pedro Costa', email: 'pedro@flyingstudio.com.br' },
    ]
    render(<MemberList members={members} />)
    expect(screen.getByTestId('member-row-user-1')).toBeInTheDocument()
    expect(screen.getByTestId('member-row-user-2')).toBeInTheDocument()
  })

  it('exibe nome do membro em cada linha', () => {
    render(<MemberList members={[baseMember]} />)
    expect(screen.getByText('Ana Lima')).toBeInTheDocument()
  })

  it('exibe email do membro em cada linha', () => {
    render(<MemberList members={[baseMember]} />)
    expect(screen.getByText('ana@flyingstudio.com.br')).toBeInTheDocument()
  })

  it('exibe role do membro (admin ou member) em cada linha', () => {
    render(<MemberList members={[baseMember]} />)
    expect(screen.getByText('member')).toBeInTheDocument()
  })

  it('exibe ferramentas autorizadas do membro em cada linha', () => {
    render(<MemberList members={[baseMember]} />)
    expect(screen.getByText('lumen')).toBeInTheDocument()
  })

  it('exibe badge "Desativado" para membro com banned_until preenchido', () => {
    const banned: Member = { ...baseMember, bannedUntil: '2126-01-01T00:00:00Z' }
    render(<MemberList members={[banned]} />)
    expect(screen.getByText(/Desativado/)).toBeInTheDocument()
  })

  it('renderiza mensagem vazia quando lista de membros está vazia', () => {
    render(<MemberList members={[]} />)
    expect(screen.getByText('Nenhum membro cadastrado.')).toBeInTheDocument()
  })
})
