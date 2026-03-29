'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink, Loader2 } from 'lucide-react'
import type { Lead, LeadDetail, ApolloContact } from '@/types/lumen'
import { LeadScoreBadge } from './LeadScoreBadge'

interface LeadDetailPanelProps {
  lead: Lead | null
  onClose: () => void
}

function confidenceLabel(level?: number) {
  if (level === undefined || level === null) return null
  if (level >= 70) return <span className="text-[10px] uppercase ml-1 text-green-500">alta</span>
  if (level >= 40) return <span className="text-[10px] uppercase ml-1 text-yellow-500">média</span>
  return <span className="text-[10px] uppercase ml-1 text-gray-400">baixa</span>
}

function formatBreakdownKey(key: string) {
  return key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

function ContactCard({ contact }: { contact: ApolloContact }) {
  return (
    <div className="mx-6 mb-3 p-4 rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
      {contact.name && <p className="text-sm font-bold text-[#1A1A2E] dark:text-white">{contact.name}</p>}
      {contact.role && <p className="text-xs text-gray-400 mt-0.5">{contact.role}</p>}
      {contact.email && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {contact.email}
          {confidenceLabel(contact.email_confidence)}
        </p>
      )}
      {contact.linkedin_url && (
        <a
          href={contact.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-purple hover:opacity-80 flex items-center gap-1 mt-1"
        >
          <ExternalLink size={10} /> LinkedIn
        </a>
      )}
      {contact.phone && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{contact.phone}</p>}
    </div>
  )
}

export function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
  const [detail, setDetail] = useState<LeadDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Fetch full lead detail when a lead is selected
  useEffect(() => {
    if (!lead) {
      setDetail(null)
      return
    }
    setLoadingDetail(true)
    fetch(`/api/tools/lumen/leads/${lead.id}`)
      .then(res => res.ok ? res.json() as Promise<LeadDetail> : null)
      .then(data => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false))
  }, [lead?.id])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Scroll lock
  useEffect(() => {
    if (lead) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [lead])

  const contacts = detail?.contacts ?? []
  const keywords = detail?.keywords ?? []
  const scoreBreakdown = detail?.score_breakdown ?? lead?.score_breakdown

  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white dark:bg-[#0D0D0D] shadow-2xl z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={lead.name}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#0D0D0D] z-10">
              <p className="text-[22px] font-bold text-[#1A1A2E] dark:text-white truncate">{lead.name}</p>
              <button
                type="button"
                autoFocus
                aria-label="Fechar painel"
                onClick={onClose}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
              </button>
            </div>

            {/* Metadata */}
            {(lead.city || lead.segment) && (
              <div className="px-6 py-3 flex gap-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                {[lead.city, lead.segment].filter(Boolean).join(' · ')}
              </div>
            )}

            {/* Score */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Score</p>
              <LeadScoreBadge score={lead.score} />
              {scoreBreakdown && Object.keys(scoreBreakdown).length > 0 && (
                <dl className="mt-3 space-y-1">
                  {Object.entries(scoreBreakdown).map(([key, value]) =>
                    value !== undefined ? (
                      <div key={key} className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <dt>{formatBreakdownKey(key)}</dt>
                        <dd>{value}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              )}
            </div>

            {/* Apollo Contacts — always rendered */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 px-6">Contatos Apollo</p>
              {loadingDetail ? (
                <div className="flex items-center gap-2 px-6 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  Carregando contatos...
                </div>
              ) : contacts.length > 0 ? (
                contacts.map((contact, i) => <ContactCard key={contact.id ?? i} contact={contact} />)
              ) : (
                <p className="px-6 text-sm text-gray-400">Nenhum contato encontrado para este lead.</p>
              )}
            </div>

            {/* Keywords — always rendered */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 px-6">Keywords Detectadas</p>
              {loadingDetail ? (
                <div className="flex items-center gap-2 px-6 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  Carregando keywords...
                </div>
              ) : keywords.length > 0 ? (
                <div className="px-6 flex flex-wrap gap-2">
                  {keywords.map(kw => (
                    <span key={kw} className="px-2 py-0.5 bg-gray-100 dark:bg-[#1A1A1A] text-xs text-gray-600 dark:text-gray-400 rounded-md">
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="px-6 text-sm text-gray-400">Nenhuma keyword detectada.</p>
              )}
            </div>

            {/* Footer — Website + Phone */}
            {(lead.website || lead.phone) && (
              <div className="px-6 py-4 flex flex-col gap-2">
                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-purple hover:opacity-80 flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    {lead.website}
                  </a>
                )}
                {lead.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{lead.phone}</p>}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
