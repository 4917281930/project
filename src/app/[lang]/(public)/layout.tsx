import { getDictionary, Locale } from '../dictionaries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={locale} dict={dict} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer lang={locale} dict={dict} />
    </div>
  )
}
