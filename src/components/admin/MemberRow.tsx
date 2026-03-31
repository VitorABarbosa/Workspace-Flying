'use client'
import type { Member } from './MemberList'

interface MemberRowProps {
  member: Member
}

export function MemberRow({ member }: MemberRowProps) {
  const isDisabled = !!member.bannedUntil

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30">
      <td className="py-3 pr-4 text-[#1A1A2E] dark:text-white">
        {member.name || '—'}
      </td>
      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
        {member.email}
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {member.role}
        </span>
        {isDisabled && (
          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            Desativado
          </span>
        )}
      </td>
      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
        {member.tools.length > 0 ? member.tools.join(', ') : '—'}
      </td>
      <td className="py-3">
        {/* Action buttons — wired in Wave 2 (plan 10-03) */}
        <span className="text-xs text-gray-400">—</span>
      </td>
    </tr>
  )
}
