'use client'
import { useState } from 'react'
import { disableMember, reactivateMember, deleteMember } from '@/app/admin/actions'
import { EditPermissionsForm } from './EditPermissionsForm'
import type { Member } from './MemberList'

interface MemberRowProps {
  member: Member
}

export function MemberRow({ member }: MemberRowProps) {
  const isDisabled = !!member.bannedUntil
  const [showEdit, setShowEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDisable() {
    setLoading(true)
    await disableMember(member.id)
    setLoading(false)
  }

  async function handleReactivate() {
    setLoading(true)
    await reactivateMember(member.id)
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    await deleteMember(member.id)
    setLoading(false)
  }

  return (
    <>
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
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowEdit((v) => !v)}
              className="text-xs text-brand-purple hover:opacity-80 transition-opacity"
            >
              Editar
            </button>

            {isDisabled ? (
              <button
                onClick={handleReactivate}
                disabled={loading}
                className="text-xs text-green-600 dark:text-green-400 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                Reativar
              </button>
            ) : (
              <button
                onClick={handleDisable}
                disabled={loading}
                className="text-xs text-yellow-600 dark:text-yellow-400 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                Desativar
              </button>
            )}

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity"
              >
                Remover
              </button>
            ) : (
              <span className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  Confirmar remoção
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-500 hover:opacity-80 transition-opacity"
                >
                  Cancelar
                </button>
              </span>
            )}
          </div>
        </td>
      </tr>
      {showEdit && (
        <tr className="border-b border-gray-100 dark:border-gray-800">
          <td colSpan={5} className="py-2 px-4">
            <EditPermissionsForm member={member} onClose={() => setShowEdit(false)} />
          </td>
        </tr>
      )}
    </>
  )
}
