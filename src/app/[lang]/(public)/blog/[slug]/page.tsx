import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getDictionary, Locale } from '../../../dictionaries'
import { db } from '@/utils/db'
import Markdown from '@/components/Markdown'
import { Calendar, Clock, ArrowLeft, ShieldAlert } from 'lucide-react'
import type { Metadata } from 'next'

interface PageParams {
  params: Promise<{ slug: string; lang: string }>
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug, lang } = await params
  const post = await db.getPostBySlug(slug, lang)
  if (!post || post.status !== 'published') return {}

  const title = post.seo_title || post.title
  const desc = post.seo_description || post.excerpt

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'article',
      publishedTime: post.published_at || undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
    alternates: {
      canonical: `/${lang}/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: PageParams) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as Locale)

  // Fetch the article details
  const post = await db.getPostBySlug(slug, lang)

  // If the article is not found or is a draft (and we are in the public path), return a 404
  if (!post || post.status !== 'published') {
    notFound()
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  // Estimate reading time
  const wordCount = post.content ? post.content.split(/\s+/).length : 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {/* Back to Blog */}
      <div className="mb-8">
        <Link
          href={`/${lang}/blog`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-550 hover:text-amber-500 transition-colors duration-150 font-semibold group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
          <span>{dict.common.back}</span>
        </Link>
      </div>

      {/* Header Info */}
      <header className="mb-8">
        {post.category && (
          <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-4 inline-block">
            {post.category.name}
          </span>
        )}

        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-100 sm:text-4xl leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {publishedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{publishedDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {readingTime} {dict.common.minutesRead}
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-900 mb-10 shadow-lg">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Excerpt Banner */}
      {post.excerpt && (
        <div className="border-l-2 border-amber-500 pl-4 py-1.5 text-slate-400 text-sm md:text-base leading-relaxed italic font-light mb-8">
          {post.excerpt}
        </div>
      )}

      {/* Article Body */}
      <main className="border-t border-slate-900 pt-8 mb-12">
        <Markdown content={post.content} />
      </main>

      {/* Tag Cloud */}
      <footer className="border-t border-slate-900 pt-6">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/${lang}/blog?tag=${tag.slug}`}
              className="rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 px-3.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors duration-150"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </footer>
    </article>
  )
}

export async function generateStaticParams() {
  const locales = ['en', 'vi']
  const paths = []

  for (const lang of locales) {
    const posts = await db.getPosts(lang, { status: 'published' })
    for (const post of posts) {
      paths.push({ lang, slug: post.slug })
    }
  }

  return paths
}
