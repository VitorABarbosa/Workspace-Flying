// Server Component — page.tsx NUNCA deve ter 'use client'
// layout.tsx já inclui <main>, Header, Footer, BackToTop — não duplicar aqui
import HeroSubtitleSection from '@/components/sections/HeroSubtitleSection'

export default function HomePage() {
  return (
    <>
      <HeroSubtitleSection />
    </>
  )
}
