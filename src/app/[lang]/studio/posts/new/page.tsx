import { getDictionary, Locale } from '../../../dictionaries'
import { db } from '@/utils/db'
import PostForm from '../PostForm'

export default async function NewPostPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  // Fetch taxonomies on server
  const categories = await db.getCategories(locale)
  const tags = await db.getTags(locale)

  return (
    <div className="animate-fadeIn">
      <PostForm
        lang={locale}
        dict={dict}
        categories={categories}
        tags={tags}
      />
    </div>
  )
}
