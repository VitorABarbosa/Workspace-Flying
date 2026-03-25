'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const TEAM_EMAIL = 'team@flyingstudio.com.br'

export default function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: TEAM_EMAIL,
      password,
    })

    if (authError) {
      if (authError.message?.toLowerCase().includes('network') || authError.status === 0) {
        setError('Erro ao conectar. Verifique sua conexão e tente novamente.')
      } else {
        setError('Senha incorreta. Tente novamente.')
      }
      setLoading(false)
      return
    }

    router.push('/tools')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A] px-6">
      <div className="w-full max-w-[400px] bg-[#F1F1F1] dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-xl p-8">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-8">
          <div
            className="w-36 h-9 bg-gray-200 dark:bg-gray-700 rounded"
            aria-hidden="true"
          />
        </div>

        {/* Heading */}
        <h1 className="text-[28px] font-bold text-[#0A0A0A] dark:text-white text-center mb-2">
          Acesso restrito
        </h1>

        {/* Subheading */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Digite a senha da equipe para continuar
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            aria-label="Senha de acesso"
            autoComplete="current-password"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            required
            className={`
              w-full h-12 px-4 mb-4 rounded-lg text-base
              bg-white dark:bg-[#0A0A0A]
              text-[#0A0A0A] dark:text-white
              border focus:outline-none focus:ring-2 focus:ring-brand-purple
              transition-colors
              ${error
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
              }
            `}
          />

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="
              w-full h-12 bg-[#7E54FE] text-white font-bold text-base rounded-lg
              hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
              transition-opacity flex items-center justify-center gap-2
            "
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {error && (
            <p
              role="alert"
              className="mt-3 text-sm text-red-500 text-center"
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
