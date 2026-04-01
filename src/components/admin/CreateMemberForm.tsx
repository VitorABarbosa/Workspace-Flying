'use client'
import { useState } from 'react'
import { createMember } from '@/app/admin/actions'
import { tools } from '@/config/tools'

export function CreateMemberForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const activeTools = tools.filter((t) => t.status === 'active')

  function handleRoleChange(newRole: 'admin' | 'member') {
    setRole(newRole)
    if (newRole === 'admin') {
      setSelectedTools(activeTools.map((t) => t.id))
    }
  }

  function toggleTool(slug: string) {
    setSelectedTools((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createMember(name, email, password, role, selectedTools)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      // Reset form on success
      setName('')
      setEmail('')
      setPassword('')
      setRole('member')
      setSelectedTools([])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h2 className="text-base font-semibold text-[#1A1A2E] dark:text-white">Novo membro</h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-[#1A1A2E] dark:text-white"
          aria-label="Nome"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-[#1A1A2E] dark:text-white"
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Senha temporária"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-[#1A1A2E] dark:text-white"
          aria-label="Senha"
        />
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'member')}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-[#1A1A2E] dark:text-white"
          aria-label="Role"
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <fieldset>
        <legend className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ferramentas autorizadas</legend>
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

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-brand-purple rounded hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Criando...' : 'Criar membro'}
      </button>
    </form>
  )
}
