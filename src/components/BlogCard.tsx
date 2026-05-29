import Link from 'next/link'
import Image from 'next/image'
import { PostWithDetails } from '../types'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { Locale } from '../app/[lang]/dictionaries'

interface BlogCardProps {
  post: PostWithDetails
  lang: Locale
  readMoreText: string
}

export default function BlogCard({ post, lang, readMoreText }: BlogCardProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : ''

  // Simple estimate: 200 words per minute reading time
  const contentForEstimation = post.content || post.translations.en?.content || post.translations.vi?.content || ''
  const wordCount = contentForEstimation.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-900 bg-slate-950/40 hover:bg-slate-950/80 transition-all duration-300 crypto-card-glow cursor-pointer">
      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-700">
            <span className="font-heading text-xs tracking-wider">killerwhaleslabs</span>
          </div>
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-md bg-amber-500 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-slate-950">
            {post.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Meta */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3">
          {publishedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{publishedDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {readingTime} {lang === 'vi' ? 'phút đọc' : 'min read'}
            </span>
          </div>
        </div>

        {/* Title & Excerpt */}
        <h3 className="font-heading text-base font-bold text-slate-200 transition-colors duration-200 group-hover:text-amber-400 line-clamp-2 leading-snug">
          <Link href={`/${lang}/blog/${post.slug}`} className="focus:outline-none">
            <span className="absolute inset-0 z-10" /> {/* Clickable block */}
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5 z-20">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] text-slate-400 border border-slate-800/80"
            >
              #{tag.name}
            </span>
          ))}
        </div>

        {/* Read More link (decorative visual cue since whole card is clickable) */}
        <div className="mt-5 flex items-center gap-1 text-xs font-bold text-amber-500 group-hover:text-amber-400 transition-colors duration-150">
          <span>{readMoreText}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  )
}
