import { LockKeyhole } from 'lucide-react'
import { AgentShell } from '@/components/tools/AgentShell'

interface LockedToolShellProps {
  toolName: string
}

export function LockedToolShell({ toolName }: LockedToolShellProps) {
  return (
    <AgentShell title={toolName}>
      <div className="mt-12 text-center py-20">
        <LockKeyhole
          size={40}
          className="text-brand-purple mx-auto mb-4"
          aria-hidden="true"
        />
        <h2 className="text-[22px] font-bold text-[#1A1A2E] dark:text-white">
          Acesso restrito
        </h2>
        <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Você não tem acesso a esta ferramenta. Contate o administrador.
        </p>
      </div>
    </AgentShell>
  )
}
