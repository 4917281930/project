'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { PostWithDetails, CategoryDetails, TagDetails } from '@/types'
import { deletePostAction } from '@/app/actions'
import { Locale } from '../dictionaries'
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  FolderOpen,
  Tag,
  Loader2,
  Calendar
} from 'lucide-react'

interface DashboardContainerProps {
  lang: Locale
  dict: any
  initialPosts: PostWithDetails[]
  initialCategories: CategoryDetails[]
  initialTags: TagDetails[]
}

type TabType = 'posts' | 'categories' | 'tags'

export default function DashboardContainer({
  lang,
  dict,
  initialPosts,
  initialCategories,
  initialTags
}: DashboardContainerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts)
  const [categories] = useState<CategoryDetails[]>(initialCategories)
  const [tags] = useState<TagDetails[]>(initialTags)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Metrics
  const totalPosts = posts.length
  const publishedCount = posts.filter((p) => p.status === 'published').length
  const draftsCount = posts.filter((p) => p.status === 'draft').length

  // Filtered posts
  const filteredPosts = posts.filter((post) => {
    const titleMatch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       post.translations.en?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       post.translations.vi?.title.toLowerCase().includes(searchQuery.toLowerCase())
    const slugMatch = post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    return titleMatch || slugMatch
  })

  // Handle post deletion
  const handleDeletePost = async (id: string) => {
    if (!window.confirm(dict.admin.deleteConfirm)) return

    setDeletingId(id)
    setError(null)

    startTransition(async () => {
      try {
        await deletePostAction(id)
        setPosts(posts.filter((p) => p.id !== id))
        showSuccess(dict.admin.successDelete)
      } catch (err: any) {
        alert(err.message || 'Error deleting post')
      } finally {
        setDeletingId(null)
      }
    })
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {/* Total Posts */}
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">
            {dict.admin.postsCount}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{totalPosts}</div>
        </div>

        {/* Published */}
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {dict.admin.publishedCount}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{publishedCount}</div>
        </div>

        {/* Drafts */}
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {dict.admin.draftsCount}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{draftsCount}</div>
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">
            {dict.admin.categoriesCount}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{categories.length}</div>
        </div>

        {/* Tags */}
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4 col-span-2 md:col-span-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">
            {dict.admin.tagsCount}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{tags.length}</div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3.5 text-xs text-emerald-400 animate-fadeIn">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Workspace Navigation (Tabs) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 border border-slate-900 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs rounded-md font-heading transition-all duration-150 ${
              activeTab === 'posts'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Articles</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs rounded-md font-heading transition-all duration-150 ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs rounded-md font-heading transition-all duration-150 ${
              activeTab === 'tags'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Tags</span>
          </button>
        </div>

        {/* Action Button depending on Tab */}
        {activeTab === 'posts' && (
          <Link
            href={`/${lang}/studio/posts/new`}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 font-heading text-xs font-bold text-slate-950 shadow-md shadow-amber-500/5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{dict.admin.createPost}</span>
          </Link>
        )}
      </div>

      {/* 3. Tab Contents */}
      <div className="mt-4">
        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {/* Search filter */}
            <div className="relative max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-550">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search slug or titles..."
                className="w-full rounded-lg border border-slate-900 bg-slate-950/20 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-650 focus:border-amber-500 focus:outline-none transition-colors duration-150"
              />
            </div>

            {/* List Table */}
            {filteredPosts.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/10">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-heading text-[10px] tracking-wider uppercase">
                      <th className="px-4 py-3">Article</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Taxonomy</th>
                      <th className="px-4 py-3">Timeline</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredPosts.map((post) => {
                      const title = post.translations[lang]?.title || post.translations.en?.title || post.slug
                      return (
                        <tr key={post.id} className="hover:bg-slate-900/10 transition-colors duration-150">
                          {/* Title / Info */}
                          <td className="px-4 py-4 max-w-sm">
                            <div className="flex items-center gap-3">
                              {post.cover_image_url && (
                                <img
                                  src={post.cover_image_url}
                                  alt=""
                                  className="h-9 w-12 rounded object-cover border border-slate-900"
                                />
                              )}
                              <div>
                                <span className="font-bold text-slate-200 block truncate max-w-xs">{title}</span>
                                <span className="font-mono text-[9px] text-slate-500 mt-0.5 block truncate max-w-xs">/{post.slug}</span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            {post.status === 'published' ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500 border border-emerald-500/20">
                                {dict.common.published}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-500 border border-amber-500/20">
                                {dict.common.draft}
                              </span>
                            )}
                          </td>

                          {/* Taxonomy */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              {post.category && (
                                <span className="text-[10px] text-slate-350">{post.category.name}</span>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {post.tags.map((t) => (
                                  <span key={t.id} className="text-[9px] text-slate-500">
                                    #{t.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                          </td>

                          {/* Action Controls */}
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {post.status === 'published' && (
                                <Link
                                  href={`/${lang}/blog/${post.slug}`}
                                  target="_blank"
                                  className="rounded border border-slate-800 bg-slate-900 hover:border-slate-700 p-1.5 text-slate-450 hover:text-slate-200 transition-colors duration-150"
                                  title="View Public Post"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              )}
                              <Link
                                href={`/${lang}/studio/posts/${post.id}`}
                                className="rounded border border-slate-800 bg-slate-900 hover:border-slate-700 p-1.5 text-slate-450 hover:text-amber-500 transition-colors duration-150"
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                disabled={deletingId === post.id}
                                className="rounded border border-slate-800 bg-slate-900 hover:border-red-500/30 p-1.5 text-slate-450 hover:text-red-400 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === post.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-12 text-center">
                <span className="font-heading text-sm font-bold text-slate-400 mb-1">No articles found</span>
                <p className="text-xs text-slate-550">Try checking your spelling or create a new article.</p>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="max-w-2xl">
            <div className="rounded-xl border border-slate-900 bg-slate-950/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-heading text-[10px] tracking-wider uppercase">
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="px-4 py-3.5 font-bold text-slate-200">{cat.name}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">/{cat.slug}</td>
                      <td className="px-4 py-3.5 text-slate-400 leading-normal max-w-xs">{cat.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg border border-slate-900/60 bg-slate-950/20 p-4 text-[10px] text-slate-500 leading-normal">
              Note: System categories are configured during project initialization. To request adding categories, update the migration files or contact your DB administrator.
            </div>
          </div>
        )}

        {/* TAGS TAB */}
        {activeTab === 'tags' && (
          <div className="max-w-xl">
            <div className="rounded-xl border border-slate-900 bg-slate-950/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-heading text-[10px] tracking-wider uppercase">
                    <th className="px-4 py-3">Tag Label</th>
                    <th className="px-4 py-3">Slug</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {tags.map((tag) => (
                    <tr key={tag.id}>
                      <td className="px-4 py-3.5 font-bold text-slate-200">#{tag.name}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">/{tag.slug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg border border-slate-900/60 bg-slate-950/20 p-4 text-[10px] text-slate-500 leading-normal">
              Note: System tags are configured during project initialization. To request adding tags, update the migration files or contact your DB administrator.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
