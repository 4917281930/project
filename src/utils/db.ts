import { createClient as createBrowserClient } from './supabase/client'
import { createClient as createServerClient } from './supabase/server'
import { PostWithDetails, PostStatus, CategoryDetails, TagDetails, Post } from '../types'

// Check if we are running in demo mode (no Supabase keys or using placeholders)
const isDemoMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('placeholder') || key.includes('placeholder')
}

export const DEMO_MODE = isDemoMode()

// In-Memory Demo Data Store (Preserved across requests in node process)
let demoPosts: PostWithDetails[] = [
  {
    id: 'post-1',
    slug: 'secure-your-web3-wallet',
    status: 'published',
    cover_image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-05-25T08:00:00Z',
    updated_at: '2026-05-25T08:00:00Z',
    published_at: '2026-05-25T08:00:00Z',
    category: {
      id: 'c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a4',
      slug: 'security-notes',
      name: 'Security Notes',
      description: 'Crucial security warnings and practices'
    },
    tags: [
      { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b4', slug: 'security', name: 'Security' },
      { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b1', slug: 'bitcoin', name: 'Bitcoin' }
    ],
    translations: {
      en: {
        title: 'How to Secure Your Web3 Wallet Against Modern Hacks',
        excerpt: 'A comprehensive guide on safeguarding your seed phrases, avoiding phishing attacks, and setting up multi-signature wallets for long-term storage.',
        content: `## The Growing Threat in Web3

Self-custody is a superpower, but it comes with extreme responsibility. If you lose your keys or get hacked, there is no customer support to restore your funds.

### 1. Hardware Wallets are Mandatory

Never store your seed phrase in plain text on your computer, cloud storage, or emails. A hardware wallet like Ledger or Trezor keeps your private keys completely isolated from the internet.

\`\`\`bash
# Rule #1 of Web3 Security
echo "Never type your seed phrase online!"
\`\`\`

### 2. Guard Against Phishing

Always double-check URLs before connecting your wallet. Attackers create exact clones of popular DApps (Uniswap, OpenSea) to steal your signature approvals.

### 3. Understanding Approval Limits

When interacting with smart contracts, only approve the exact amount you want to swap. Infinite approvals let rogue contracts drain your wallet at any time.

* Use revoke tools like revoke.cash regularly.
* Separate your active trading wallet from your cold storage vault.
`,
        seo_title: 'Ultimate Web3 Wallet Security Guide | killerwhaleslabs',
        seo_description: 'Protect your crypto assets. Learn how to secure your hardware wallet, seed phrases, and avoid wallet drainer phishing scams.'
      },
      vi: {
        title: 'Cách bảo mật ví Web3 chống lại các hình thức hack hiện đại',
        excerpt: 'Hướng dẫn toàn diện về bảo vệ cụm từ khôi phục (seed phrase), phòng chống lừa đảo (phishing) và thiết lập ví đa chữ ký cho lưu trữ lâu dài.',
        content: `## Mối đe dọa ngày càng tăng trong Web3

Tự quản lý tài sản là một quyền năng lớn, nhưng đi kèm với trách nhiệm cực kỳ cao. Nếu bạn mất khóa hoặc bị hack, không có bộ phận hỗ trợ khách hàng nào để khôi phục tiền của bạn.

### 1. Ví phần cứng là bắt buộc

Không bao giờ lưu cụm từ khôi phục (seed phrase) dưới dạng văn bản thuần túy trên máy tính, lưu trữ đám mây hoặc email. Ví phần cứng như Ledger hoặc Trezor giữ các khóa riêng tư của bạn hoàn toàn tách biệt khỏi internet.

\`\`\`bash
# Quy tắc số 1 về bảo mật Web3
echo "Không bao giờ nhập seed phrase của bạn trực tuyến!"
\`\`\`

### 2. Phòng tránh lừa đảo (Phishing)

Luôn kiểm tra kỹ URL trước khi kết nối ví của bạn. Kẻ tấn công tạo ra các bản sao giống hệt các DApp phổ biến (Uniswap, OpenSea) để đánh cắp chữ ký phê duyệt của bạn.

### 3. Hiểu rõ về giới hạn phê duyệt (Approval Limits)

Khi tương tác với hợp đồng thông minh, chỉ phê duyệt số lượng chính xác bạn muốn giao dịch. Phê duyệt vô hạn (infinite approvals) cho phép các hợp đồng lừa đảo rút cạn ví của bạn bất kỳ lúc nào.

* Sử dụng các công cụ thu hồi như revoke.cash thường xuyên.
* Tách biệt ví giao dịch hoạt động của bạn với ví trữ lạnh.
`,
        seo_title: 'Hướng dẫn bảo mật ví Web3 tối ưu | killerwhaleslabs',
        seo_description: 'Bảo vệ tài sản crypto của bạn. Tìm hiểu cách bảo mật ví phần cứng, cụm từ khôi phục và tránh lừa đảo rút cạn ví.'
      }
    },
    title: '', excerpt: '', content: '', seo_title: '', seo_description: '' // will be mapped
  },
  {
    id: 'post-2',
    slug: 'advanced-solidity-security-patterns',
    status: 'published',
    cover_image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-05-27T10:00:00Z',
    updated_at: '2026-05-27T10:20:00Z',
    published_at: '2026-05-27T10:00:00Z',
    category: {
      id: 'c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a2',
      slug: 'tech-tricks',
      name: 'Tech Tricks',
      description: 'Advanced development guidelines'
    },
    tags: [
      { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b3', slug: 'solidity', name: 'Solidity' },
      { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b4', slug: 'security', name: 'Security' }
    ],
    translations: {
      en: {
        title: 'Advanced Solidity Security Patterns for DeFI Developers',
        excerpt: 'Explore reentrancy guards, checks-effects-interactions pattern, oracle manipulation defense, and auditing tools for Solidity smart contracts.',
        content: `## Smart Contract Auditing Principles

Writing secure smart contracts in Solidity is difficult. A single bug can lead to millions of dollars of user funds lost.

### 1. Reentrancy Defense

Reentrancy occurs when a contract sends funds to an untrusted contract before updating its state. The recipient can call back into the withdraw function recursively.

**Anti-pattern:**
\`\`\`solidity
// VULNERABLE
function withdraw() public {
    uint balance = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: balance}("");
    require(success);
    balances[msg.sender] = 0;
}
\`\`\`

**Checks-Effects-Interactions Pattern:**
\`\`\`solidity
// SECURE
function withdraw() public {
    uint balance = balances[msg.sender];
    balances[msg.sender] = 0; // State changed first!
    (bool success, ) = msg.sender.call{value: balance}("");
    require(success);
}
\`\`\`

Alternatively, use OpenZeppelin's \`ReentrancyGuard\` and apply the \`nonReentrant\` modifier.

### 2. Safe Oracle Pricing

Never use Uniswap Spot Price as an oracle directly. It is vulnerable to flash loan manipulation. Use Time-Weighted Average Price (TWAP) or reliable decentralized oracles like Chainlink.
`,
        seo_title: 'Solidity Security & Audit Patterns | killerwhaleslabs',
        seo_description: 'Write secure smart contracts. Reentrancy defense, Checks-Effects-Interactions, and flash loan security tips for Solidity developers.'
      },
      vi: {
        title: 'Các mẫu thiết kế bảo mật Solidity nâng cao cho nhà phát triển DeFi',
        excerpt: 'Khám phá reentrancy guards, mẫu kiểm tra-tác động-tương tác, phòng chống thao túng oracle và các công cụ kiểm tra hợp đồng thông minh.',
        content: `## Nguyên tắc kiểm định Smart Contract

Viết hợp đồng thông minh an toàn trong Solidity là rất khó. Một lỗi nhỏ có thể dẫn đến hàng triệu đô la của người dùng bị đánh cắp.

### 1. Phòng thủ Reentrancy (Tấn công tái nhập)

Reentrancy xảy ra khi một hợp đồng gửi tiền đến một hợp đồng không đáng tin cậy trước khi cập nhật trạng thái của nó. Người nhận có thể gọi lại hàm withdraw một cách đệ quy.

**Mẫu bị lỗi:**
\`\`\`solidity
// DỄ BỊ TẤN CÔNG
function withdraw() public {
    uint balance = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: balance}("");
    require(success);
    balances[msg.sender] = 0;
}
\`\`\`

**Mẫu Checks-Effects-Interactions (Kiểm tra - Thay đổi - Tương tác):**
\`\`\`solidity
// AN TOÀN
function withdraw() public {
    uint balance = balances[msg.sender];
    balances[msg.sender] = 0; // Thay đổi trạng thái trước!
    (bool success, ) = msg.sender.call{value: balance}("");
    require(success);
}
\`\`\`

Hoặc có thể sử dụng \`ReentrancyGuard\` của OpenZeppelin và áp dụng modifier \`nonReentrant\`.

### 2. Sử dụng Oracle giá an toàn

Không bao giờ sử dụng trực tiếp Giá giao ngay (Spot Price) của Uniswap làm nguồn cấp giá oracle. Nó rất dễ bị thao túng qua Flash Loan. Hãy dùng giá trung bình theo thời gian (TWAP) hoặc Chainlink.
`,
        seo_title: 'Bảo mật Solidity nâng cao & Mẫu kiểm định | killerwhaleslabs',
        seo_description: 'Viết smart contract an toàn. Chống tấn công reentrancy, checks-effects-interactions, và bảo mật flash loan cho lập trình viên Solidity.'
      }
    },
    title: '', excerpt: '', content: '', seo_title: '', seo_description: ''
  },
  {
    id: 'post-3',
    slug: 'airdrop-farming-strategies',
    status: 'draft',
    cover_image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-05-28T14:00:00Z',
    updated_at: '2026-05-28T14:00:00Z',
    published_at: null,
    category: {
      id: 'c1a80c9e-5e36-4d51-9c3f-4dfdfa4501b1', // crypto-tips (let's map)
      slug: 'crypto-tips',
      name: 'Crypto Tips',
      description: 'Actionable tips and advice'
    },
    tags: [
      { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b2', slug: 'ethereum', name: 'Ethereum' }
    ],
    translations: {
      en: {
        title: 'Mastering Crypto Airdrop Strategies for Layer-2 Protocols',
        excerpt: 'A blueprint on identifying promising projects, maximizing transaction volume, interacting with bridge contracts, and managing multi-account setups.',
        content: `## Airdrop Farming Strategy

Farming airdrops can be highly lucrative if done systematically. This draft post outlines how to get started on new Layer-2 networks.

### 1. Focus on Transaction Quality

Projects look for real users, not bots. Make transactions over multiple weeks, interact with different protocols, and maintain a reasonable balance.

### 2. High-Yield Bridge Interactivity

Interacting with the official bridge is often the most heavily weighted criteria. Ensure you bridge at least $500-1000 worth of ETH to qualify for higher tiers.
`,
        seo_title: 'Master Layer-2 Airdrop Farming | killerwhaleslabs',
        seo_description: 'Step-by-step guide to qualify for massive L2 token airdrops. Optimize transaction history and use bridges safely.'
      },
      vi: {
        title: 'Làm chủ chiến lược săn Airdrop trên các giao thức Layer-2',
        excerpt: 'Kế hoạch chi tiết về cách tìm kiếm dự án hứa hẹn, tối ưu hóa khối lượng giao dịch, tương tác với cầu nối và quản lý nhiều ví hiệu quả.',
        content: `## Chiến lược săn Airdrop

Săn airdrop có thể đem lại lợi nhuận lớn nếu làm việc có hệ thống. Bản nháp này phác thảo cách bắt đầu trên các mạng lưới Layer-2 mới.

### 1. Tập trung vào Chất lượng giao dịch

Các dự án tìm kiếm người dùng thật, không phải bot. Thực hiện giao dịch trong nhiều tuần, tương tác với nhiều giao thức khác nhau và giữ số dư hợp lý.

### 2. Tương tác với cầu nối (Bridge)

Tương tác với cầu nối chính thức (native bridge) thường là tiêu chí quan trọng nhất. Hãy chuyển tối thiểu $500-1000 ETH để đủ điều kiện nhận các mốc airdrop cao hơn.
`,
        seo_title: 'Săn Airdrop Layer-2 chuyên nghiệp | killerwhaleslabs',
        seo_description: 'Hướng dẫn chi tiết từng bước để đủ điều kiện nhận airdrop từ các dự án L2 lớn. Tối ưu hóa khối lượng giao dịch.'
      }
    },
    title: '', excerpt: '', content: '', seo_title: '', seo_description: ''
  }
]

let demoCategories: CategoryDetails[] = [
  { id: 'c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a1', slug: 'crypto-tips', name: 'Crypto Tips', description: 'Actionable advice and quick tips for navigating crypto markets.' },
  { id: 'c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a2', slug: 'tech-tricks', name: 'Tech Tricks', description: 'Advanced programming and command-line tips for web3 builders.' },
  { id: 'c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a3', slug: 'web3-guides', name: 'Web3 Guides', description: 'Step-by-step documentation on smart contracts and blockchain DApps.' },
  { id: 'c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a4', slug: 'security-notes', name: 'Security Notes', description: 'Crucial alerts, smart contract audits, and key security practices.' }
]

let demoTags: TagDetails[] = [
  { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b1', slug: 'bitcoin', name: 'Bitcoin' },
  { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b2', slug: 'ethereum', name: 'Ethereum' },
  { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b3', slug: 'solidity', name: 'Solidity' },
  { id: 't1a80c9e-5e36-4d51-9c3f-4dfdfa4501b4', slug: 'security', name: 'Security' }
]

// Mapping helper to map translations array into flat properties for current locale
function mapPostTranslations(post: PostWithDetails, locale: string): PostWithDetails {
  const trans = post.translations[locale as 'en' | 'vi'] || post.translations['en'] || {
    title: '', excerpt: '', content: '', seo_title: '', seo_description: ''
  }
  return {
    ...post,
    title: trans.title,
    excerpt: trans.excerpt || '',
    content: trans.content,
    seo_title: trans.seo_title || trans.title,
    seo_description: trans.seo_description || trans.excerpt || ''
  }
}

// Map categories based on locale
function mapCategoryTranslations(cat: any, locale: string): CategoryDetails {
  const translations: Record<string, Record<string, string>> = {
    'crypto-tips': { en: 'Crypto Tips', vi: 'Mẹo Crypto' },
    'tech-tricks': { en: 'Tech Tricks', vi: 'Thủ thuật Công nghệ' },
    'web3-guides': { en: 'Web3 Guides', vi: 'Hướng dẫn Web3' },
    'security-notes': { en: 'Security Notes', vi: 'Ghi chú Bảo mật' }
  }
  const name = translations[cat.slug]?.[locale] || cat.name || cat.slug
  return { ...cat, name }
}

// Map tags based on locale
function mapTagTranslations(tag: any, locale: string): TagDetails {
  const translations: Record<string, Record<string, string>> = {
    'bitcoin': { en: 'Bitcoin', vi: 'Bitcoin' },
    'ethereum': { en: 'Ethereum', vi: 'Ethereum' },
    'solidity': { en: 'Solidity', vi: 'Solidity' },
    'security': { en: 'Security', vi: 'Bảo mật' }
  }
  const name = translations[tag.slug]?.[locale] || tag.name || tag.slug
  return { ...tag, name }
}

export const db = {
  // POSTS
  async getPosts(
    locale: string,
    options?: { categorySlug?: string; tagSlug?: string; status?: 'published' | 'draft' | 'all' }
  ): Promise<PostWithDetails[]> {
    const status = options?.status || 'published'

    if (DEMO_MODE) {
      let posts = [...demoPosts]

      // Filter status
      if (status === 'published') {
        posts = posts.filter(p => p.status === 'published')
      } else if (status === 'draft') {
        posts = posts.filter(p => p.status === 'draft')
      }

      // Filter category
      if (options?.categorySlug) {
        posts = posts.filter(p => p.category?.slug === options.categorySlug)
      }

      // Filter tag
      if (options?.tagSlug) {
        posts = posts.filter(p => p.tags.some(t => t.slug === options.tagSlug))
      }

      // Sort by newest created_at
      posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return posts.map(p => {
        const mapped = mapPostTranslations(p, locale)
        if (mapped.category) mapped.category = mapCategoryTranslations(mapped.category, locale)
        mapped.tags = mapped.tags.map(t => mapTagTranslations(t, locale))
        return mapped
      })
    }

    // REAL SUPABASE INTEGRATION
    try {
      const supabase = await createServerClient()
      const catFilter = options?.categorySlug
      const tagFilter = options?.tagSlug

      let selectFields = '*,category:categories(*),tags:post_tags(tag_id(id, slug)),post_translations(*)'
      if (catFilter && tagFilter) {
        selectFields = '*,category:categories!inner(*),tags:post_tags!inner(tag_id!inner(id, slug)),post_translations(*)'
      } else if (catFilter) {
        selectFields = '*,category:categories!inner(*),tags:post_tags(tag_id(id, slug)),post_translations(*)'
      } else if (tagFilter) {
        selectFields = '*,category:categories(*),tags:post_tags!inner(tag_id!inner(id, slug)),post_translations(*)'
      }

      let query = supabase.from('posts').select(selectFields)

      if (status === 'published') {
        query = query.eq('status', 'published')
      } else if (status === 'draft') {
        query = query.eq('status', 'draft')
      }

      if (catFilter) {
        query = query.eq('category.slug', catFilter)
      }
      if (tagFilter) {
        query = query.eq('tags.tag_id.slug', tagFilter)
      }

      const { data, error } = await query
      if (error) throw error
      if (!data) return []

      // Filter & Format results
      let formatted: PostWithDetails[] = data.map((row: any) => {
        // Map tags
        const tags: TagDetails[] = (row.tags || []).map((t: any) => ({
          id: t.tag_id?.id || '',
          slug: t.tag_id?.slug || '',
          name: t.tag_id?.slug || '' // will be localized
        }))

        // Map translations
        const translations: Record<string, any> = {}
        row.post_translations?.forEach((trans: any) => {
          translations[trans.locale] = {
            title: trans.title,
            excerpt: trans.excerpt,
            content: trans.content,
            seo_title: trans.seo_title,
            seo_description: trans.seo_description
          }
        })

        const basePost: PostWithDetails = {
          id: row.id,
          slug: row.slug,
          status: row.status as PostStatus,
          cover_image_url: row.cover_image_url,
          created_at: row.created_at,
          updated_at: row.updated_at,
          published_at: row.published_at,
          category: row.category ? { id: row.category.id, slug: row.category.slug, name: '', description: '' } : null,
          tags,
          translations,
          title: '', excerpt: '', content: '', seo_title: '', seo_description: '' // mapped below
        }

        return basePost
      })

      // Sort
      formatted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      // Fetch and merge category & tag translations
      const catsList = await this.getCategories(locale)
      const tagsList = await this.getTags(locale)

      return formatted.map(p => {
        const mapped = mapPostTranslations(p, locale)
        if (mapped.category) {
          const matchCat = catsList.find(c => c.id === mapped.category?.id)
          mapped.category = matchCat || mapped.category
        }
        mapped.tags = mapped.tags.map(t => {
          const matchTag = tagsList.find(tg => tg.id === t.id)
          return matchTag || t
        })
        return mapped
      })
    } catch (e) {
      console.error('Supabase posts fetch failed, fallback to empty:', e)
      return []
    }
  },

  async getPostBySlug(slug: string, locale: string): Promise<PostWithDetails | null> {
    if (DEMO_MODE) {
      const match = demoPosts.find(p => p.slug === slug)
      if (!match) return null
      const mapped = mapPostTranslations(match, locale)
      if (mapped.category) mapped.category = mapCategoryTranslations(mapped.category, locale)
      mapped.tags = mapped.tags.map(t => mapTagTranslations(t, locale))
      return mapped
    }

    try {
      const supabase = await createServerClient()
      const { data: row, error } = await supabase
        .from('posts')
        .select(`
          *,
          category:categories(*),
          tags:post_tags(tag_id(id, slug)),
          post_translations(*)
        `)
        .eq('slug', slug)
        .single()

      if (error || !row) return null

      const tags: TagDetails[] = (row.tags || []).map((t: any) => ({
        id: t.tag_id?.id || '',
        slug: t.tag_id?.slug || '',
        name: t.tag_id?.slug || ''
      }))

      const translations: Record<string, any> = {}
      row.post_translations?.forEach((trans: any) => {
        translations[trans.locale] = {
          title: trans.title,
          excerpt: trans.excerpt,
          content: trans.content,
          seo_title: trans.seo_title,
          seo_description: trans.seo_description
        }
      })

      const basePost: PostWithDetails = {
        id: row.id,
        slug: row.slug,
        status: row.status as PostStatus,
        cover_image_url: row.cover_image_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
        published_at: row.published_at,
        category: row.category ? { id: row.category.id, slug: row.category.slug, name: '', description: '' } : null,
        tags,
        translations,
        title: '', excerpt: '', content: '', seo_title: '', seo_description: ''
      }

      const mapped = mapPostTranslations(basePost, locale)

      // Fetch categories & tags
      const catsList = await this.getCategories(locale)
      const tagsList = await this.getTags(locale)

      if (mapped.category) {
        const matchCat = catsList.find(c => c.id === mapped.category?.id)
        mapped.category = matchCat || mapped.category
      }
      mapped.tags = mapped.tags.map(t => {
        const matchTag = tagsList.find(tg => tg.id === t.id)
        return matchTag || t
      })

      return mapped
    } catch (e) {
      console.error('Supabase getPostBySlug failed:', e)
      return null
    }
  },

  // CATEGORIES
  async getCategories(locale: string): Promise<CategoryDetails[]> {
    if (DEMO_MODE) {
      return demoCategories.map(c => mapCategoryTranslations(c, locale))
    }

    try {
      const supabase = await createServerClient()
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          slug,
          category_translations(*)
        `)

      if (error || !data) return []

      return data.map((row: any) => {
        const trans = row.category_translations?.find((t: any) => t.locale === locale) ||
                      row.category_translations?.find((t: any) => t.locale === 'en')
        return {
          id: row.id,
          slug: row.slug,
          name: trans?.name || row.slug,
          description: trans?.description || null
        }
      })
    } catch (e) {
      console.error('Supabase categories fetch failed:', e)
      return []
    }
  },

  // TAGS
  async getTags(locale: string): Promise<TagDetails[]> {
    if (DEMO_MODE) {
      return demoTags.map(t => mapTagTranslations(t, locale))
    }

    try {
      const supabase = await createServerClient()
      const { data, error } = await supabase
        .from('tags')
        .select(`
          id,
          slug,
          tag_translations(*)
        `)

      if (error || !data) return []

      return data.map((row: any) => {
        const trans = row.tag_translations?.find((t: any) => t.locale === locale) ||
                      row.tag_translations?.find((t: any) => t.locale === 'en')
        return {
          id: row.id,
          slug: row.slug,
          name: trans?.name || row.slug
        }
      })
    } catch (e) {
      console.error('Supabase tags fetch failed:', e)
      return []
    }
  },

  // ADMIN OPERATIONS
  async createPost(
    post: Omit<PostWithDetails, 'id' | 'created_at' | 'updated_at' | 'title' | 'excerpt' | 'content' | 'seo_title' | 'seo_description'>
  ): Promise<PostWithDetails> {
    const id = 'post-' + Math.random().toString(36).substr(2, 9)
    const newPost: PostWithDetails = {
      ...post,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: post.status === 'published' ? new Date().toISOString() : null,
      title: '', excerpt: '', content: '', seo_title: '', seo_description: '' // pre-mapped later
    }

    if (DEMO_MODE) {
      // Find category object
      const catObj = demoCategories.find(c => c.id === post.category?.id) || null
      newPost.category = catObj
      // Find tags object
      newPost.tags = (post.tags || []).map(t => demoTags.find(dt => dt.id === t.id || dt.slug === t.slug)).filter(Boolean) as TagDetails[]

      demoPosts.push(newPost)
      return newPost
    }

    try {
      const supabase = await createServerClient()
      // Insert post base row
      const { data: baseRow, error: baseErr } = await supabase
        .from('posts')
        .insert({
          slug: post.slug,
          status: post.status,
          cover_image_url: post.cover_image_url,
          category_id: post.category?.id || null,
          published_at: post.status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (baseErr || !baseRow) throw baseErr

      // Insert Translations
      const translationsToInsert: any[] = []
      if (post.translations.en) {
        translationsToInsert.push({
          post_id: baseRow.id,
          locale: 'en',
          ...post.translations.en
        })
      }
      if (post.translations.vi) {
        translationsToInsert.push({
          post_id: baseRow.id,
          locale: 'vi',
          ...post.translations.vi
        })
      }

      if (translationsToInsert.length > 0) {
        const { error: transErr } = await supabase
          .from('post_translations')
          .insert(translationsToInsert)
        if (transErr) throw transErr
      }

      // Insert Tags
      if (post.tags && post.tags.length > 0) {
        const tagsToInsert = post.tags.map(t => ({
          post_id: baseRow.id,
          tag_id: t.id
        }))
        const { error: tagsErr } = await supabase
          .from('post_tags')
          .insert(tagsToInsert)
        if (tagsErr) throw tagsErr
      }

      return { ...newPost, id: baseRow.id }
    } catch (e) {
      console.error('Supabase createPost failed:', e)
      throw e
    }
  },

  async updatePost(id: string, post: Partial<PostWithDetails>): Promise<void> {
    if (DEMO_MODE) {
      const index = demoPosts.findIndex(p => p.id === id)
      if (index !== -1) {
        const current = demoPosts[index]
        const catObj = demoCategories.find(c => c.id === post.category?.id) || null
        const tagsObj = (post.tags || []).map(t => demoTags.find(dt => dt.id === t.id || dt.slug === t.slug)).filter(Boolean) as TagDetails[]

        demoPosts[index] = {
          ...current,
          ...post,
          category: catObj,
          tags: tagsObj,
          updated_at: new Date().toISOString(),
          published_at: post.status === 'published' ? (current.published_at || new Date().toISOString()) : null
        } as PostWithDetails
      }
      return
    }

    try {
      const supabase = await createServerClient()
      
      // Update Base
      const { error: baseErr } = await supabase
        .from('posts')
        .update({
          slug: post.slug,
          status: post.status,
          cover_image_url: post.cover_image_url,
          category_id: post.category?.id || null,
          published_at: post.status === 'published' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (baseErr) throw baseErr

      // Update Translations (Upsert since some might be newly added in edits)
      const translationsToUpsert: any[] = []
      if (post.translations?.en) {
        translationsToUpsert.push({
          post_id: id,
          locale: 'en',
          ...post.translations.en
        })
      }
      if (post.translations?.vi) {
        translationsToUpsert.push({
          post_id: id,
          locale: 'vi',
          ...post.translations.vi
        })
      }

      if (translationsToUpsert.length > 0) {
        const { error: transErr } = await supabase
          .from('post_translations')
          .upsert(translationsToUpsert, { onConflict: 'post_id,locale' })
        if (transErr) throw transErr
      }

      // Update Tags: Delete existing tags and insert new ones
      const { error: delTagsErr } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', id)

      if (delTagsErr) throw delTagsErr

      if (post.tags && post.tags.length > 0) {
        const tagsToInsert = post.tags.map(t => ({
          post_id: id,
          tag_id: t.id
        }))
        const { error: insTagsErr } = await supabase
          .from('post_tags')
          .insert(tagsToInsert)
        if (insTagsErr) throw insTagsErr
      }
    } catch (e) {
      console.error('Supabase updatePost failed:', e)
      throw e
    }
  },

  async deletePost(id: string): Promise<void> {
    if (DEMO_MODE) {
      demoPosts = demoPosts.filter(p => p.id !== id)
      return
    }

    try {
      const supabase = await createServerClient()
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (e) {
      console.error('Supabase deletePost failed:', e)
      throw e
    }
  }
}
