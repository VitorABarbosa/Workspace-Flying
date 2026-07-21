'use client'
import Link from 'next/link'

const FINANCEIRO_URL = process.env.NEXT_PUBLIC_FINANCEIRO_URL || 'https://financeiro-production-b1c8.up.railway.app'

export function FinanceiroAgent() {
  return (
    <section className="flex flex-col pt-16">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-brand-dark">
        <div>
          <Link
            href="/tools"
            className="text-sm text-brand-purple hover:opacity-80 transition-opacity duration-150"
          >
            ← Ferramentas
          </Link>
          <h1 className="text-[18px] font-bold text-[#1A1A2E] dark:text-white leading-tight">
            Financeiro
          </h1>
        </div>
        <a
          href={FINANCEIRO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-purple hover:opacity-80 transition-opacity duration-150"
        >
          Abrir em nova aba ↗
        </a>
      </div>
      <iframe
        src={FINANCEIRO_URL}
        title="Financeiro"
        className="w-full min-h-[80vh] border-0"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </section>
  )
}
