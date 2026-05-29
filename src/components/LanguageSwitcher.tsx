'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Locale } from '../app/[lang]/dictionaries'

export default function LanguageSwitcher({ currentLang }: { currentLang: Locale }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLanguageChange = (newLang: Locale) => {
    if (newLang === currentLang) return

    // Replace the language segment in the pathname
    // e.g. /en/blog/some-slug -> /vi/blog/some-slug
    const segments = pathname.split('/')
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'vi')) {
      segments[1] = newLang
    } else {
      // Fallback
      segments.unshift(newLang)
    }

    const newPath = segments.join('/') || '/'
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-900/80 p-1 border border-slate-800">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 text-xs rounded-full font-heading transition-all duration-200 ${
          currentLang === 'en'
            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('vi')}
        className={`px-3 py-1 text-xs rounded-full font-heading transition-all duration-200 ${
          currentLang === 'vi'
            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        aria-label="Chuyển sang tiếng Việt"
      >
        VI
      </button>
    </div>
  )
}
