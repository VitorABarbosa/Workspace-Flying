// Server Component — protegido pelo middleware (redireciona para /login sem sessão)
import { tools } from '@/config/tools'
import { ToolCard } from '@/components/tools/ToolCard'
import Heading from '@/components/ui/Heading'
import FadeIn from '@/components/ui/FadeIn'
import { cn } from '@/lib/cn'

export default function ToolsPage() {
  return (
    <section
      className={cn(
        'py-20 md:py-24',
        'bg-white dark:bg-brand-dark',
        'px-6 md:px-8',
      )}
    >
      <div className="max-w-[1200px] mx-auto">
        <FadeIn delay={0}>
          <Heading eyebrow="FERRAMENTAS DISPONÍVEIS" level={2}>
            Escolha uma{' '}
            <span className="text-brand-purple">ferramenta</span>
          </Heading>
        </FadeIn>

        {tools.length === 0 ? (
          <FadeIn delay={0.15}>
            <div className="mt-12 text-center">
              <p className="text-[22px] font-bold text-[#1A1A2E] dark:text-white">
                Ferramentas em preparação
              </p>
              <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                Os agentes de IA da Flying Studio estão sendo configurados. Volte em breve.
              </p>
            </div>
          </FadeIn>
        ) : (
          <ul
            role="list"
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tools.map((tool, index) => (
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
