'use client'
import { MemberRow } from './MemberRow'

export interface Member {
  id: string
  email: string
  name: string
  role: 'admin' | 'member'
  tools: string[]
  bannedUntil?: string
}

interface MemberListProps {
  members: Member[]
}

export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Nenhum membro cadastrado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
            <th className="py-3 pr-4 font-semibold text-[#1A1A2E] dark:text-white">Nome</th>
            <th className="py-3 pr-4 font-semibold text-[#1A1A2E] dark:text-white">Email</th>
            <th className="py-3 pr-4 font-semibold text-[#1A1A2E] dark:text-white">Role</th>
            <th className="py-3 pr-4 font-semibold text-[#1A1A2E] dark:text-white">Ferramentas</th>
            <th className="py-3 font-semibold text-[#1A1A2E] dark:text-white">Ações</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
