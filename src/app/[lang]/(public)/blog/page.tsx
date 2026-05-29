import type { Metadata } from 'next'
import Link from 'next/link'
import { getDictionary, Locale } from '../../dictionaries'
import { db } from '@/utils/db'
import BlogCard from '@/components/BlogCard'
import { Filter, Grid, Tag, FolderOpen, ArrowRight, X } from 'lucide-react'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ category?: string; tag?: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const { category, tag } = await searchParams
  const dict = await getDictionary(lang as Locale)

  let title = dict.common.blog
  if (category) {
    const catsMap: Record<string, string> = {
      'crypto-tips': dict.categories['crypto-tips'] || 'Crypto Tips',
      'tech-tricks': dict.categories['tech-tricks'] || 'Tech Tricks',
      'web3-guides': dict.categories['web3-guides'] || 'Web3 Guides',
      'security-notes': dict.categories['security-notes'] || 'Security Notes',
    }
    const catName = catsMap[category] || category
    title = `${catName} | ${dict.common.blog}`
  } else if (tag) {
    title = `#${tag} | ${dict.common.blog}`
  }

  return {
    title,
    description: dict.common.description,
  }
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ category?: string; tag?: string; q?: string }>
}) {
  const { lang } = await params
  const { category, tag, q } = await searchParams
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  // Fetch data
  const posts = await db.getPosts(locale, {
    categorySlug: category,
    tagSlug: tag,
    status: 'published',
  })
  
  const categories = await db.getCategories(lang)
  const tags = await db.getTags(lang)

  // Filter posts by search query if present
  const filteredPosts = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(q.toLowerCase())
      )
    : posts

  const activeCategory = categories.find((c) => c.slug === category)
  const activeTag = tags.find((t) => t.slug === tag)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-heading text-2xl font-bold tracking-wider text-slate-100 sm:text-3xl flex items-center justify-center md:justify-start gap-3">
          <span className="h-6 w-1 bg-amber-500 rounded" />
          {dict.common.blog}
        </h1>
        <p className="mt-2 text-xs text-slate-400 font-light max-w-xl">
          {lang === 'vi'
            ? 'Khám phá kiến thức crypto chuyên sâu, tài liệu lập trình solidity và các ghi chú bảo mật smart contract.'
            : 'Explore deep-dive crypto analysis, solidity programming techniques, and critical smart contract audit logs.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 flex flex-col gap-8">
          {/* Active Filters Clear Button */}
          {(category || tag || q) && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1.5 font-heading">
                <Filter className="h-3 w-3" />
                Active Filters
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCategory && (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-800">
                    Category: {activeCategory.name}
                  </span>
                )}
                {activeTag && (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-800">
                    Tag: #{activeTag.name}
                  </span>
                )}
                {q && (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-800">
                    Search: &ldquo;{q}&rdquo;
                  </span>
                )}
              </div>
              <Link
                href={`/${lang}/blog`}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-850 bg-slate-900/60 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors duration-150"
              >
                <X className="h-3 w-3" />
                Clear All Filters
              </Link>
            </div>
          )}

          {/* Categories Filter */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-5">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-amber-500" />
              {dict.common.categories}
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href={`/${lang}/blog${tag ? `?tag=${tag}` : ''}`}
                className={`text-xs px-3 py-2 rounded-lg transition-all duration-150 ${
                  !category
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-450 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                {dict.common.all}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${lang}/blog?category=${cat.slug}${tag ? `&tag=${tag}` : ''}`}
                  className={`text-xs px-3 py-2 rounded-lg transition-all duration-150 flex items-center justify-between ${
                    category === cat.slug
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tags Cloud Filter */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-5">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-500" />
              {dict.common.tags}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tg) => (
                <Link
                  key={tg.id}
                  href={`/${lang}/blog?tag=${tg.slug}${category ? `&category=${category}` : ''}`}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all duration-150 ${
                    tag === tg.slug
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                      : 'text-slate-400 bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:text-slate-250'
                  }`}
                >
                  #{tg.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Articles Feed */}
        <main className="lg:col-span-3">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  lang={locale}
                  readMoreText={dict.common.readMore}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-900 bg-slate-950/10 p-16 text-center">
              <div className="mb-4 rounded-full bg-slate-900/60 p-4 w-fit border border-slate-800">
                <Grid className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-350 mb-2">
                {dict.common.noArticlesHeading}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {dict.common.noArticles}
              </p>
              <Link
                href={`/${lang}/blog`}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400"
              >
                <span>{lang === 'vi' ? 'Xem tất cả' : 'View all articles'}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
