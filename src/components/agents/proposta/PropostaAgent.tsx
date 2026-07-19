'use client'

import { AgentShell } from '@/components/tools/AgentShell'

export function PropostaAgent() {
  return (
    <AgentShell
      title="Proposta"
      description="Gere propostas comerciais em .docx a partir de uma descrição livre."
    >
      <p className="text-gray-500 dark:text-gray-400">Em construção…</p>
    </AgentShell>
  )
}
