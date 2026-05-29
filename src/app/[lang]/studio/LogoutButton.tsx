'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { logoutAction } from '@/app/actions'
import { LogOut, Loader2 } from 'lucide-react'

interface LogoutButtonProps {
  lang: string
  text: string
}

export default function LogoutButton({ lang, text }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
      router.push(`/${lang}`)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg border border-slate-900 hover:border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      <span>{text}</span>
    </button>
  )
}
