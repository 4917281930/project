import { getDictionary, Locale } from '../../dictionaries'
import { checkAdminSession } from '@/app/actions'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import { Lock } from 'lucide-react'

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  // Redirect to dashboard if already authenticated
  const isAuth = await checkAdminSession()
  if (isAuth) {
    redirect(`/${locale}/studio`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-amber-500/5 filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-violet-500/5 filter blur-3xl" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-md shadow-amber-500/5">
            <Lock className="h-5 w-5 text-amber-500 crypto-glow-text" />
          </div>
          <h2 className="mt-6 font-heading text-xl font-extrabold text-slate-100 uppercase tracking-widest">
            {dict.admin.loginTitle}
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-light">
            {dict.admin.loginSubtitle}
          </p>
        </div>

        <LoginForm lang={locale} dict={dict} />
      </div>
    </div>
  )
}
