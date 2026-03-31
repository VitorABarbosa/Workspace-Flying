'use client'
import { useState } from 'react'
import { updatePermissions } from '@/app/admin/actions'
import { tools } from '@/config/tools'
import type { Member } from './MemberList'

interface EditPermissionsFormProps {
  member: Member
  onClose: () => void
}

export function EditPermissionsForm({ member, onClose }: EditPermissionsFormProps) {
  const [selectedTools, setSelectedTools] = useState<string[]>(member.tools)
  const [role, setRole] = useState<'admin' | 'member'>(member.role)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const activeTools = tools.filter((t) => t.status === 'active')

  function toggleTool(slug: string) {
    setSelectedTools((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // Pass existing app_metadata as empty object — server will spread it
    // (member object does not carry full app_metadata; server reads fresh from getUser)
    const result = await updatePermissions(member.id, selectedTools, role, {})
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
          className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-[#1A1A2E] dark:text-white"
          aria-label="Role"
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <fieldset>
        <legend className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ferramentas</legend>
        <div className="flex flex-wrap gap-3">
          {activeTools.map((tool) => (
            <label key={tool.id} className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTools.includes(tool.id)}
                onChange={() => toggleTool(tool.id)}
              />
              {tool.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium text-white bg-brand-purple rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:opacity-80 transition-opacity"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
