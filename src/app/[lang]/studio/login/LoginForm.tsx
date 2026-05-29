'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions'
import { Locale } from '../../dictionaries'
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react'

interface LoginFormProps {
  lang: Locale
  dict: any
}

export default function LoginForm({ lang, dict }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await loginAction(formData)
      if (result.success) {
        router.push(`/${lang}/studio`)
        router.refresh()
      } else {
        setError(result.error || 'Authentication failed.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Dev Notice Box */}
      <div className="rounded-lg border border-slate-900 bg-slate-950/40 p-4 text-[11px] text-slate-400 leading-relaxed font-light">
        <span className="font-heading font-bold text-amber-500 block mb-1">LOCAL DEVELOPMENT MODE</span>
        To log in without live Supabase database tables, use:
        <div className="mt-1 font-mono text-slate-300">
          Email: <span className="text-amber-400">admin@killerwhaleslabs.com</span>
          <br />
          Password: <span className="text-amber-400">password</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400 animate-fadeIn">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-slate-350 tracking-wider font-heading uppercase">
            {dict.admin.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none transition-colors duration-150"
            placeholder="admin@killerwhaleslabs.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold text-slate-350 tracking-wider font-heading uppercase">
            {dict.admin.passwordLabel}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
            className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none transition-colors duration-150"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-550/40 px-4 py-2.5 font-heading text-sm font-bold text-slate-950 transition-all duration-200 shadow-md shadow-amber-500/5 cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>{dict.admin.loginButton}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
