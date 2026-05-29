'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPostAction, updatePostAction } from '@/app/actions'
import { PostWithDetails, CategoryDetails, TagDetails, PostStatus } from '@/types'
import { Locale } from '../../dictionaries'
import Markdown from '@/components/Markdown'
import {
  Save,
  ArrowLeft,
  Eye,
  Edit3,
  Loader2,
  Globe,
  PlusCircle,
  FileText,
  Search,
  Check
} from 'lucide-react'

interface PostFormProps {
  lang: Locale
  dict: any
  categories: CategoryDetails[]
  tags: TagDetails[]
  post?: PostWithDetails // If provided, we are editing
}

export default function PostForm({ lang, dict, categories, tags, post }: PostFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Form State
  const [slug, setSlug] = useState(post?.slug || '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '')
  const [status, setStatus] = useState<PostStatus>(post?.status || 'draft')
  const [categoryId, setCategoryId] = useState<string>(post?.category?.id || '')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post?.tags.map((t) => t.id) || []
  )

  // Multilingual translations state
  const [activeLocale, setActiveLocale] = useState<'en' | 'vi'>('en')
  const [translations, setTranslations] = useState({
    en: {
      title: post?.translations.en?.title || '',
      excerpt: post?.translations.en?.excerpt || '',
      content: post?.translations.en?.content || '',
      seo_title: post?.translations.en?.seo_title || '',
      seo_description: post?.translations.en?.seo_description || '',
    },
    vi: {
      title: post?.translations.vi?.title || '',
      excerpt: post?.translations.vi?.excerpt || '',
      content: post?.translations.vi?.content || '',
      seo_title: post?.translations.vi?.seo_title || '',
      seo_description: post?.translations.vi?.seo_description || '',
    }
  })

  // Mode: edit or markdown preview
  const [previewMode, setPreviewMode] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Auto-generate slug from English title if empty
  const handleTitleChange = (val: string, locale: 'en' | 'vi') => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], title: val }
    }))

    if (locale === 'en' && !post) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generatedSlug)
    }
  }

  const handleTransFieldChange = (field: string, val: string, locale: 'en' | 'vi') => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: val }
    }))
  }

  // Toggle Tag selection
  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validations
    if (!slug.trim()) {
      setFormError('Slug is required.')
      return
    }
    if (!translations.en.title.trim() && !translations.vi.title.trim()) {
      setFormError('At least one language title must be filled.')
      return
    }
    if (!translations.en.content.trim() && !translations.vi.content.trim()) {
      setFormError('At least one language content must be filled.')
      return
    }

    const payload = {
      slug,
      status,
      cover_image_url: coverImageUrl.trim() || null,
      category: categoryId ? { id: categoryId, slug: '', name: '', description: '' } : null,
      tags: selectedTagIds.map((id) => ({ id, slug: '', name: '' })),
      translations: {
        en: translations.en.title.trim() ? translations.en : undefined,
        vi: translations.vi.title.trim() ? translations.vi : undefined,
      },
      published_at: status === 'published' ? new Date().toISOString() : null,
    }

    startTransition(async () => {
      try {
        if (post) {
          await updatePostAction(post.id, payload)
        } else {
          await createPostAction(payload)
        }
        router.push(`/${lang}/studio`)
        router.refresh()
      } catch (err: any) {
        setFormError(err.message || 'Failed to save post.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${lang}/studio`)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-500 transition-colors duration-150 font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-900" />
          <h2 className="font-heading text-base font-bold text-slate-200">
            {post ? dict.admin.editPost : dict.admin.createPost}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg border border-slate-900 hover:border-slate-800 bg-slate-950 px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer"
          >
            {previewMode ? (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Post</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Preview Post</span>
              </>
            )}
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 font-heading text-xs font-bold text-slate-950 transition-all duration-200 shadow-md shadow-amber-500/5 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{status === 'published' ? 'Publish Now' : 'Save Draft'}</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 font-light flex items-center gap-2">
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form Fields Layout */}
      {!previewMode ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Translation Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Locale Tabs Toggle */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 border border-slate-900 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setActiveLocale('en')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md font-heading transition-all duration-150 ${
                  activeLocale === 'en'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="h-3 w-3" />
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLocale('vi')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md font-heading transition-all duration-150 ${
                  activeLocale === 'vi'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="h-3 w-3" />
                <span>Tiếng Việt</span>
              </button>
            </div>

            {/* Translation Fields */}
            <div className="space-y-5 rounded-xl border border-slate-900 bg-slate-950/15 p-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-450 tracking-wider font-heading uppercase">
                  {dict.admin.titleLabel} ({activeLocale.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={translations[activeLocale].title}
                  onChange={(e) => handleTitleChange(e.target.value, activeLocale)}
                  className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-650 focus:border-amber-500 focus:outline-none transition-colors duration-150 font-heading"
                  placeholder={activeLocale === 'en' ? 'Article Title' : 'Tiêu đề bài viết'}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-450 tracking-wider font-heading uppercase">
                  {dict.admin.excerptLabel} ({activeLocale.toUpperCase()})
                </label>
                <textarea
                  value={translations[activeLocale].excerpt}
                  onChange={(e) => handleTransFieldChange('excerpt', e.target.value, activeLocale)}
                  rows={2}
                  className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-250 placeholder-slate-650 focus:border-amber-500 focus:outline-none transition-colors duration-150 leading-relaxed font-light"
                  placeholder={activeLocale === 'en' ? 'Short summary...' : 'Tóm tắt bài viết...'}
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-450 tracking-wider font-heading uppercase">
                  {dict.admin.contentLabel} ({activeLocale.toUpperCase()})
                </label>
                <textarea
                  value={translations[activeLocale].content}
                  onChange={(e) => handleTransFieldChange('content', e.target.value, activeLocale)}
                  rows={12}
                  className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2.5 text-xs text-slate-250 placeholder-slate-650 focus:border-amber-500 focus:outline-none transition-colors duration-150 leading-relaxed font-mono"
                  placeholder="## Markdown supported headings, code blocks, bullet points..."
                />
              </div>
            </div>

            {/* SEO Settings Panel */}
            <div className="space-y-5 rounded-xl border border-slate-900 bg-slate-950/15 p-5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300">
                SEO Metadata ({activeLocale.toUpperCase()})
              </h3>
              
              {/* SEO Title */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider font-heading uppercase">
                  {dict.admin.seoTitleLabel}
                </label>
                <input
                  type="text"
                  value={translations[activeLocale].seo_title}
                  onChange={(e) => handleTransFieldChange('seo_title', e.target.value, activeLocale)}
                  className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-700 focus:border-amber-500 focus:outline-none transition-colors duration-150 font-heading"
                  placeholder="Custom SEO Title"
                />
              </div>

              {/* SEO Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider font-heading uppercase">
                  {dict.admin.seoDescLabel}
                </label>
                <textarea
                  value={translations[activeLocale].seo_description}
                  onChange={(e) => handleTransFieldChange('seo_description', e.target.value, activeLocale)}
                  rows={2}
                  className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-250 placeholder-slate-700 focus:border-amber-500 focus:outline-none transition-colors duration-150 leading-relaxed font-light"
                  placeholder="SEO description (google search snippet)..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-6">
            {/* Base Settings Panel */}
            <div className="space-y-5 rounded-xl border border-slate-900 bg-slate-950/15 p-5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-350">
                Article Settings
              </h3>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider font-heading uppercase">
                  {dict.admin.statusLabel}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`flex-1 py-2 text-xs rounded-lg font-bold border transition-all duration-150 cursor-pointer ${
                      status === 'draft'
                        ? 'bg-amber-500 border-amber-500 text-slate-950'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`flex-1 py-2 text-xs rounded-lg font-bold border transition-all duration-150 cursor-pointer ${
                      status === 'published'
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Publish
                  </button>
                </div>
              </div>

              {/* Slug Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider font-heading uppercase">
                  {dict.admin.slugLabel}
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                  className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-250 focus:border-amber-500 focus:outline-none transition-colors duration-150 font-mono"
                  placeholder="secure-your-web3-wallet"
                />
              </div>

              {/* Cover Image Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider font-heading uppercase">
                  {dict.admin.coverImageLabel}
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="block w-full rounded-lg border border-slate-900 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-250 focus:border-amber-500 focus:outline-none transition-colors duration-150"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider font-heading uppercase">
                  {dict.admin.categoryLabel}
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-900 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none transition-colors duration-150"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags Selection Panel */}
            <div className="space-y-5 rounded-xl border border-slate-900 bg-slate-950/15 p-5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-350">
                {dict.admin.tagsLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`text-[10px] px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                          : 'border-slate-800 text-slate-400 bg-slate-950 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      <span>#{tag.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Real-Time Preview Workspace */
        <div className="rounded-xl border border-slate-900 bg-slate-950/30 p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-900 pb-4">
            <span className="inline-block rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 font-heading text-[10px] font-bold text-amber-500 uppercase">
              {categories.find((c) => c.id === categoryId)?.name || 'Preview Category'}
            </span>
            <h1 className="font-heading text-2xl font-extrabold text-slate-100 sm:text-4xl mt-3">
              {translations[activeLocale].title || 'Article Title Preview'}
            </h1>
            <div className="mt-2 text-[10px] font-mono text-slate-500">
              URL Preview: /blog/{slug || 'post-slug'} ({activeLocale.toUpperCase()})
            </div>
          </div>

          {coverImageUrl && (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 max-h-[350px]">
              <img
                src={coverImageUrl}
                alt=""
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}

          {translations[activeLocale].excerpt && (
            <div className="border-l-2 border-amber-500 pl-4 py-1 italic text-slate-400 text-sm leading-relaxed">
              {translations[activeLocale].excerpt}
            </div>
          )}

          <div className="border-t border-slate-900 pt-6">
            <Markdown content={translations[activeLocale].content || '*Write content in editor to preview markdown*'} />
          </div>
        </div>
      )}
    </form>
  )
}
