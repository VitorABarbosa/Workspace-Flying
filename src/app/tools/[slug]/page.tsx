import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getToolBySlug } from '@/config/tools'
import { AgentShell } from '@/components/tools/AgentShell'
import { PesquisadorAgent } from '@/components/agents/pesquisador/PesquisadorAgent'
import { LumenAgent } from '@/components/agents/lumen/LumenAgent'
import type { Tool } from '@/config/tools'

// Mapa de componentes de agente.
// Para adicionar novo agente: importar o componente e adicionar uma linha aqui.
const AGENT_COMPONENTS: Record<string, React.ComponentType> = {
  pesquisador: PesquisadorAgent,
  lumen: LumenAgent,
}

function ComingSoonShell({ tool }: { tool: Tool }) {
  return (
    <AgentShell title={tool.name} description={tool.description}>
      <div className="mt-12 text-center py-20">
        <p className="text-[22px] font-bold text-[#1A1A2E] dark:text-white">
          Em breve
        </p>
        <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Esta ferramenta está em desenvolvimento. Acesse o catálogo para ver o que já está disponível.
        </p>
        <Link
          href="/tools"
          className="mt-6 inline-block text-sm text-brand-purple hover:opacity-80 transition-opacity duration-150"
        >
          Ver ferramentas disponíveis
        </Link>
      </div>
    </AgentShell>
  )
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug)

  // Slug não existe no registry → 404
  if (!tool) notFound()

  // Ferramenta existe mas componente ainda não foi construído
  const AgentComponent = AGENT_COMPONENTS[params.slug]
  if (!AgentComponent) {
    return <ComingSoonShell tool={tool} />
  }

  return <AgentComponent />
}
