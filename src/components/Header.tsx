'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Locale } from '../app/[lang]/dictionaries'
import LanguageSwitcher from './LanguageSwitcher'
import { Menu, X, Landmark } from 'lucide-react'

interface HeaderProps {
  lang: Locale
  dict: {
    common: {
      home: string
      blog: string
      admin: string
    }
  }
}

export default function Header({ lang, dict }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: dict.common.home, href: `/${lang}` },
    { name: dict.common.blog, href: `/${lang}/blog` }
  ]

  const isActive = (href: string) => {
    if (href === `/${lang}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/50 transition-all duration-300">
            <span className="font-heading text-lg font-bold text-amber-500 crypto-glow-text">w</span>
          </div>
          <span className="font-heading text-lg font-bold tracking-wider text-slate-100 transition-colors duration-200 group-hover:text-amber-500">
            killerwhaleslabs
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium tracking-wide transition-all duration-200 hover:text-amber-400 ${
                isActive(item.href) ? 'text-amber-500 font-semibold border-b-2 border-amber-500 pb-1' : 'text-slate-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Language Switcher and Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher currentLang={lang} />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher currentLang={lang} />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all duration-200"
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-900 bg-background/95 px-4 py-4 backdrop-blur-lg">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium tracking-wide py-2 border-b border-slate-900/50 ${
                  isActive(item.href) ? 'text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
