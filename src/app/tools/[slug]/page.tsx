import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { getToolBySlug, getAreaBySlug, getToolsByArea } from '@/config/tools'
import type { Tool, Area } from '@/config/tools'
import { AgentShell } from '@/components/tools/AgentShell'
import { ToolCard } from '@/components/tools/ToolCard'
import { PesquisadorAgent } from '@/components/agents/pesquisador/PesquisadorAgent'
import { LumenAgent } from '@/components/agents/lumen/LumenAgent'
import { PropostaAgent } from '@/components/agents/proposta/PropostaAgent'
import FadeIn from '@/components/ui/FadeIn'
import { cn } from '@/lib/cn'
import { auth } from '@/lib/auth'
import { hasToolPermission } from '@/lib/permissions'
import { LockedToolShell } from '@/components/tools/LockedToolShell'

// Mapa de componentes de agente.
// Para adicionar novo agente: importar o componente e adicionar uma linha aqui.
const AGENT_COMPONENTS: Record<string, React.ComponentType> = {
  pesquisador: PesquisadorAgent,
  lumen: LumenAgent,
  proposta: PropostaAgent,
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

function AreaPageContent({ area }: { area: Area }) {
  const areaTools = getToolsByArea(area.slug)

  return (
    <section
      className={cn(
        'py-20 md:py-24',
        'bg-white dark:bg-brand-dark',
        'px-6 md:px-8',
      )}
    >
      <div className="max-w-[1200px] mx-auto">
        <Link
          href="/tools"
          className="text-sm text-brand-purple hover:opacity-80 transition-opacity duration-150 mb-6 inline-block"
        >
          ← Ferramentas
        </Link>

        <h1 className="text-[22px] font-bold text-[#1A1A2E] dark:text-white mt-2">
          {area.name}
        </h1>

        {areaTools.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-base text-gray-600 dark:text-gray-400">
              Nenhuma ferramenta disponível nesta área ainda
            </p>
          </div>
        ) : (
          <ul
            role="list"
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {areaTools.map((tool, index) => (
              <li key={tool.id}>
                <FadeIn delay={index * 0.1}>
                  <ToolCard tool={tool} />
                </FadeIn>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  // 1. Check tool registry first — existing tool pages are unaffected
  const tool = getToolBySlug(params.slug)
  if (tool) {
    // Permission check runs FIRST — before any dispatch (avoids Pitfall 5)
    if (tool.requiresAuth) {
      const session = await auth.api.getSession({ headers: await headers() })
      const allowed = session ? await hasToolPermission(session.user.id, tool.id) : false
      if (!allowed) {
        return <LockedToolShell toolName={tool.name} />
      }
    }

    const AgentComponent = AGENT_COMPONENTS[params.slug]
    if (!AgentComponent) {
      return <ComingSoonShell tool={tool} />
    }
    return <AgentComponent />
  }

  // 2. Check area registry
  const area = getAreaBySlug(params.slug)
  if (area) {
    return <AreaPageContent area={area} />
  }

  // 3. Neither — 404
  notFound()
}
