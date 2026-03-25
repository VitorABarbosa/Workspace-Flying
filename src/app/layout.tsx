import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import Providers from '@/components/layout/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BackToTop from '@/components/ui/BackToTop'
import '@/styles/globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'Flying Studio',
  description: 'Tecnologia Artística 3D para o mercado imobiliário',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={outfit.variable}>
      <body className="bg-white dark:bg-brand-dark text-gray-900 dark:text-white antialiased">
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  )
}
