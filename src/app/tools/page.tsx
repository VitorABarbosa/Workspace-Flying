// Server Component — protegido pelo middleware (redireciona para /login sem sessão)
import { AREAS, getToolsByArea } from '@/config/tools'
import { AreaCard } from '@/components/tools/AreaCard'
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
          <Heading eyebrow="ÁREAS DISPONÍVEIS" level={2}>
            Escolha uma{' '}
            <span className="text-brand-purple">área</span>
          </Heading>
        </FadeIn>

        <ul
          role="list"
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {AREAS.map((area, index) => {
            const count = getToolsByArea(area.slug).filter(
              (t) => t.status === 'active',
            ).length
            return (
              <li key={area.slug}>
                <FadeIn delay={index * 0.1}>
                  <AreaCard area={area} toolCount={count} />
                </FadeIn>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
