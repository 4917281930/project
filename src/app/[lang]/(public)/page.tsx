import Link from 'next/link'
import { getDictionary, Locale } from '../dictionaries'
import { db } from '@/utils/db'
import BlogCard from '@/components/BlogCard'
import { ArrowRight, Terminal, Shield, Compass, Cpu } from 'lucide-react'

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  // Fetch only published posts
  const posts = await db.getPosts(locale, { status: 'published' })
  const latestPosts = posts.slice(0, 3)

  const categories = await db.getCategories(locale)

  // Icon mapping for categories to give them a premium visual feel
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'security-notes':
        return <Shield className="h-6 w-6 text-amber-500" />
      case 'tech-tricks':
        return <Terminal className="h-6 w-6 text-amber-500" />
      case 'web3-guides':
        return <Cpu className="h-6 w-6 text-amber-500" />
      default:
        return <Compass className="h-6 w-6 text-amber-500" />
    }
  }

  return (
    <div className="flex flex-col gap-16 py-12 md:py-20">
      {/* 1. Hero Section */}
      <section className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs text-amber-500 mb-6">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-heading tracking-wide uppercase font-bold text-[10px]">
            {lang === 'vi' ? 'Trạm Nghiên Cứu Crypto' : 'Crypto Research Station'}
          </span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl md:text-6xl leading-[1.1] mb-6">
          {dict.home.heroTitle.split('&').map((text, i) => (
            <span key={i} className="block md:inline">
              {i > 0 && <span className="text-amber-500 crypto-glow-text"> & </span>}
              {text.trim()}
            </span>
          ))}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg leading-relaxed mb-10 font-light">
          {dict.home.heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${lang}/blog`}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-heading text-sm font-bold text-slate-950 hover:bg-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <span>{dict.common.readMore}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#about-labs"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-6 py-3 font-heading text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-all duration-200 cursor-pointer"
          >
            {lang === 'vi' ? 'Tìm hiểu thêm' : 'Explore Vision'}
          </a>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-900 pt-16">
          <h2 className="font-heading text-xl font-bold tracking-wider text-slate-200 mb-8 flex items-center gap-3">
            <span className="h-4 w-1 bg-amber-500 rounded" />
            {dict.home.featuredCategory}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${lang}/blog?category=${cat.slug}`}
                className="group flex flex-col justify-between p-6 rounded-xl border border-slate-900 bg-slate-950/20 hover:bg-slate-950/80 transition-all duration-300 crypto-card-glow cursor-pointer"
              >
                <div>
                  <div className="mb-4 rounded-lg bg-slate-900 p-2.5 w-fit border border-slate-800 group-hover:border-amber-500/20 group-hover:bg-amber-500/5 transition-all duration-300">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors duration-150">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-amber-500 transition-colors duration-150">
                  <span>{lang === 'vi' ? 'Xem các bài viết' : 'Browse channel'}</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Latest Publications Section */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-900 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-xl font-bold tracking-wider text-slate-200 flex items-center gap-3">
              <span className="h-4 w-1 bg-amber-500 rounded" />
              {dict.home.latestPosts}
            </h2>
            <Link
              href={`/${lang}/blog`}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors duration-150 cursor-pointer"
            >
              <span>{lang === 'vi' ? 'Tất cả bài viết' : 'View all articles'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  lang={locale}
                  readMoreText={dict.common.readMore}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-12 text-center">
              <h3 className="font-heading text-sm font-bold text-slate-400 mb-2">
                {dict.common.noArticlesHeading}
              </h3>
              <p className="text-xs text-slate-500">{dict.common.noArticles}</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Vision Info Banner */}
      <section id="about-labs" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/5 filter blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-violet-500/5 filter blur-3xl" />
          
          <div className="relative z-10 max-w-3xl">
            <h2 className="font-heading text-lg font-bold text-slate-200 tracking-wider mb-4">
              {dict.home.aboutTitle}
            </h2>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light mb-8">
              {dict.home.aboutText}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-slate-900/60 pt-8">
              <div>
                <div className="font-heading text-xl font-bold text-amber-500 crypto-glow-text">Bilingual</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">VI / EN System</div>
              </div>
              <div>
                <div className="font-heading text-xl font-bold text-amber-500 crypto-glow-text">OLED Dark</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Eye-Friendly UI</div>
              </div>
              <div>
                <div className="font-heading text-xl font-bold text-amber-500 crypto-glow-text">0.9s FMP</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Optimized Speed</div>
              </div>
              <div>
                <div className="font-heading text-xl font-bold text-amber-500 crypto-glow-text">Supabase</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Secure Auth & RLS</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
