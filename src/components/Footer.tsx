import Link from 'next/link'
import { Locale } from '../app/[lang]/dictionaries'
import { Lock } from 'lucide-react'

interface FooterProps {
  lang: Locale
  dict: {
    common: {
      title: string
      description: string
      admin: string
    }
    home: {
      aboutTitle: string
      aboutText: string
    }
  }
}

export default function Footer({ lang, dict }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/50 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <span className="font-heading text-base font-bold tracking-wider text-slate-200">
              {dict.common.title}
            </span>
            <p className="max-w-xs text-sm text-slate-400 leading-relaxed">
              {dict.common.description}
            </p>
          </div>

          {/* Topics Grid */}
          <div className="flex flex-col gap-3">
            <span className="font-heading text-sm font-semibold tracking-wider text-slate-300">
              Content Channels
            </span>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
              <span className="hover:text-amber-500 transition-colors duration-150">#cryptotips</span>
              <span className="hover:text-amber-500 transition-colors duration-150">#techtricks</span>
              <span className="hover:text-amber-500 transition-colors duration-150">#web3guides</span>
              <span className="hover:text-amber-500 transition-colors duration-150">#securitynotes</span>
            </div>
          </div>

          {/* Research Vision */}
          <div className="flex flex-col gap-3">
            <span className="font-heading text-sm font-semibold tracking-wider text-slate-300">
              {dict.home.aboutTitle}
            </span>
            <p className="text-sm text-slate-400 leading-relaxed">
              {dict.home.aboutText}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900/60 mt-10 pt-6 text-xs text-slate-500">
          <div>
            &copy; {currentYear} {dict.common.title}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            {/* Discrete Portal Link for Admins */}
            <Link
              href={`/${lang}/studio`}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition-colors duration-150"
              title={dict.common.admin}
              aria-label="Secure Portal"
            >
              <Lock className="h-3 w-3" />
              <span className="sr-only">{dict.common.admin}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
