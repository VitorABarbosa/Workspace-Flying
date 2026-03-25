import { cn } from '@/lib/cn'

interface HeadingProps {
  eyebrow?: string
  level?: 1 | 2 | 3
  children: React.ReactNode
  className?: string
}

export default function Heading({
  eyebrow,
  level = 2,
  children,
  className,
}: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'

  return (
    <div className={className}>
      {eyebrow && (
        <p className="text-[13px] font-bold tracking-[3px] uppercase text-brand-purple mb-2">
          {eyebrow}
        </p>
      )}
      <Tag
        className={cn(
          level === 1 && 'text-[clamp(40px,6vw,72px)] font-extrabold leading-[1.05]',
          level === 2 && 'text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1]',
          level === 3 && 'text-[22px] font-bold leading-tight',
          'text-[#1A1A2E] dark:text-white'
        )}
      >
        {children}
      </Tag>
    </div>
  )
}
