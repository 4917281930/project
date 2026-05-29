import { getDictionary, Locale } from '../dictionaries'
import { db } from '@/utils/db'
import DashboardContainer from './DashboardContainer'

export default async function StudioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  // Fetch all posts (published and drafts), categories, and tags
  const posts = await db.getPosts(locale, { status: 'all' })
  const categories = await db.getCategories(locale)
  const tags = await db.getTags(locale)

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-xl font-bold tracking-wider text-slate-100 uppercase sm:text-2xl flex items-center gap-2.5">
          <span className="h-5 w-1 bg-amber-500 rounded" />
          {dict.admin.dashboardTitle}
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-light">
          {locale === 'vi' 
            ? 'Tạo, quản lý ấn phẩm nghiên cứu, phân loại danh mục và nhãn thẻ.'
            : 'Author, publish, edit research entries, and manage taxonomies.'}
        </p>
      </div>

      {/* Interactive dashboard client container */}
      <DashboardContainer
        lang={locale}
        dict={dict}
        initialPosts={posts}
        initialCategories={categories}
        initialTags={tags}
      />
    </div>
  )
}
