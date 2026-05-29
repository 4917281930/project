import { getDictionary, Locale } from '../dictionaries'
import { checkAdminSession } from '@/app/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { LayoutDashboard, FileText, ArrowLeft, Shield } from 'lucide-react'

export default async function StudioLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  // Server-side authentication guard
  const isAuth = await checkAdminSession()
  if (!isAuth) {
    redirect(`/${locale}/studio/login`)
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/studio`} className="flex items-center gap-2 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Shield className="h-4 w-4 text-amber-500" />
              </div>
              <span className="font-heading text-sm font-bold tracking-widest text-slate-100">
                studio
              </span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-900 hidden sm:block" />
            <Link
              href={`/${locale}`}
              className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-500 transition-colors duration-150"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Site</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded bg-slate-900 px-2 py-0.5 font-heading text-[10px] font-bold text-amber-500 border border-slate-800">
              Admin
            </div>
            <LogoutButton lang={locale} text={dict.common.logout} />
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
