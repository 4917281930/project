import type { Metadata } from 'next'
import { getDictionary, hasLocale } from './dictionaries'
import { notFound } from 'next/navigation'
import '../globals.css'

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'vi' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const dict = await getDictionary(lang)

  return {
    title: {
      default: dict.common.title,
      template: `%s | ${dict.common.title}`
    },
    description: dict.common.description,
    metadataBase: new URL('https://killerwhaleslabs.com'),
    robots: {
      index: true,
      follow: true
    }
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  return (
    <html lang={lang} className="dark" style={{ colorScheme: 'dark' }}>
      <body className="crypto-grid min-h-screen bg-background text-foreground antialiased font-body">
        {children}
      </body>
    </html>
  )
}
