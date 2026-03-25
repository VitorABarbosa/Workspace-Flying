// Server Component — sem interatividade
import Link from 'next/link'
import FadeIn from '@/components/ui/FadeIn'
import Heading from '@/components/ui/Heading'
import { cn } from '@/lib/cn'

export default function HeroSubtitleSection() {
  return (
    <section className={cn(
      'py-20 md:py-24',
      'bg-white dark:bg-brand-dark',
      'px-6 md:px-8'
    )}>
      <div className="max-w-[1200px] mx-auto">
        <FadeIn>
          <Heading
            eyebrow="HUB INTERNO DE IA"
            level={2}
          >
            Ferramentas que{' '}
            <span className="text-brand-purple">potencializam</span>{' '}
            o time
          </Heading>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className={cn(
            'mt-4 text-base leading-relaxed max-w-2xl',
            'text-gray-600 dark:text-gray-400'
          )}>
            Acesse agentes de IA criados especialmente para os processos da Flying Studio.
            Cada ferramenta resolve um problema real do dia a dia — direto no browser,
            sem configuração, sem fricção.
          </p>
        </FadeIn>
        <FadeIn delay={0.28}>
          <Link
            href="/tools"
            className={cn(
              'inline-flex items-center gap-2 mt-8',
              'bg-brand-purple hover:bg-brand-purple/90',
              'text-white text-sm font-semibold',
              'px-6 py-3 rounded-full',
              'transition-colors duration-200'
            )}
          >
            Conhecer as ferramentas
            <span aria-hidden>→</span>
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
