import { notFound } from 'next/navigation'
import { getDictionary, Locale } from '../../../dictionaries'
import { db } from '@/utils/db'
import PostForm from '../PostForm'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string; lang: string }>
}) {
  const { id, lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  // Fetch all posts to find by ID
  const posts = await db.getPosts(locale, { status: 'all' })
  const post = posts.find((p) => p.id === id)

  if (!post) {
    notFound()
  }

  // Fetch taxonomies
  const categories = await db.getCategories(locale)
  const tags = await db.getTags(locale)

  return (
    <div className="animate-fadeIn">
      <PostForm
        lang={locale}
        dict={dict}
        categories={categories}
        tags={tags}
        post={post}
      />
    </div>
  )
}
