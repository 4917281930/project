export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  slug: string;
  status: PostStatus;
  cover_image_url: string | null;
  category_id: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PostTranslation {
  id: string;
  post_id: string;
  locale: 'en' | 'vi';
  title: string;
  excerpt: string | null;
  content: string;
  seo_title: string | null;
  seo_description: string | null;
}

export interface Category {
  id: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  locale: 'en' | 'vi';
  name: string;
  description: string | null;
}

export interface Tag {
  id: string;
  slug: string;
  created_at: string;
}

export interface TagTranslation {
  id: string;
  tag_id: string;
  locale: 'en' | 'vi';
  name: string;
}

export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

// Aggregated UI types for clean props
export interface CategoryDetails {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export interface TagDetails {
  id: string;
  slug: string;
  name: string;
}

export interface PostTranslationDetails {
  title: string;
  excerpt: string | null;
  content: string;
  seo_title: string | null;
  seo_description: string | null;
}

export interface PostWithDetails {
  id: string;
  slug: string;
  status: PostStatus;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  category: CategoryDetails | null;
  tags: TagDetails[];
  translations: {
    en?: PostTranslationDetails;
    vi?: PostTranslationDetails;
  };
  // Pre-mapped single translation for the current locale
  title: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
}
