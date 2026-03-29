'use client'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import type { Lead } from '@/types/lumen'
import { LeadScoreBadge } from './LeadScoreBadge'

interface LeadDetailPanelProps {
  lead: Lead | null
  onClose: () => void
}

function confidenceColor(level?: string) {
  if (level === 'high') return 'text-green-500'
  if (level === 'medium') return 'text-yellow-500'
  return 'text-gray-400'
}

function confidenceLabel(level?: string) {
  if (level === 'high') return 'alta'
  if (level === 'medium') return 'média'
  return 'baixa'
}

function formatBreakdownKey(key: string) {
  return key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

export function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
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
              {lead.score_breakdown && Object.keys(lead.score_breakdown).length > 0 && (
                <dl className="mt-3 space-y-1">
                  {Object.entries(lead.score_breakdown).map(([key, value]) =>
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

            {/* Apollo Contacts */}
            {lead.apollo_contacts && lead.apollo_contacts.length > 0 && (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 mt-4 px-6">Contatos Apollo</p>
                {lead.apollo_contacts.map((contact, i) => (
                  <div key={i} className="mx-6 mb-3 p-4 rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
                    <p className="text-sm font-bold text-[#1A1A2E] dark:text-white">{contact.name}</p>
                    {contact.title && <p className="text-xs text-gray-400 mt-0.5">{contact.title}</p>}
                    {contact.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {contact.email}
                        {contact.email_confidence && (
                          <span className={`text-[10px] uppercase ml-1 ${confidenceColor(contact.email_confidence)}`}>
                            {confidenceLabel(contact.email_confidence)}
                          </span>
                        )}
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
                ))}
              </>
            )}

            {/* Keywords */}
            {lead.keywords && lead.keywords.length > 0 && (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 mt-4 px-6">Keywords Detectadas</p>
                <div className="px-6 flex flex-wrap gap-2 pb-4">
                  {lead.keywords.map(kw => (
                    <span key={kw} className="px-2 py-0.5 bg-gray-100 dark:bg-[#1A1A1A] text-xs text-gray-600 dark:text-gray-400 rounded-md">
                      {kw}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Footer — Website + Phone */}
            {(lead.website || lead.phone) && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
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
