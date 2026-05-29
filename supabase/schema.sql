-- Supabase Schema for killerwhaleslabs
-- Multilingual Crypto Content Platform (Vietnamese and English)

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (linking to Supabase Auth users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- 2. Categories Table
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Enable RLS on categories
alter table public.categories enable row level security;

-- 3. Category Translations Table
create table if not exists public.category_translations (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references public.categories(id) on delete cascade not null,
    locale text not null check (locale in ('vi', 'en')),
    name text not null,
    description text,
    unique(category_id, locale)
);

-- Enable RLS on category_translations
alter table public.category_translations enable row level security;

-- 4. Tags Table
create table if not exists public.tags (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    created_at timestamptz default now() not null
);

-- Enable RLS on tags
alter table public.tags enable row level security;

-- 5. Tag Translations Table
create table if not exists public.tag_translations (
    id uuid primary key default gen_random_uuid(),
    tag_id uuid references public.tags(id) on delete cascade not null,
    locale text not null check (locale in ('vi', 'en')),
    name text not null,
    unique(tag_id, locale)
);

-- Enable RLS on tag_translations
alter table public.tag_translations enable row level security;

-- 6. Posts Table
create table if not exists public.posts (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    status text not null default 'draft' check (status in ('draft', 'published')),
    cover_image_url text,
    category_id uuid references public.categories(id) on delete set null,
    author_id uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    published_at timestamptz
);

-- Enable RLS on posts
alter table public.posts enable row level security;

-- 7. Post Translations Table
create table if not exists public.post_translations (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references public.posts(id) on delete cascade not null,
    locale text not null check (locale in ('vi', 'en')),
    title text not null,
    excerpt text,
    content text not null,
    seo_title text,
    seo_description text,
    unique(post_id, locale)
);

-- Enable RLS on post_translations
alter table public.post_translations enable row level security;

-- 8. Post Tags Junction Table
create table if not exists public.post_tags (
    post_id uuid references public.posts(id) on delete cascade not null,
    tag_id uuid references public.tags(id) on delete cascade not null,
    primary key(post_id, tag_id)
);

-- Enable RLS on post_tags
alter table public.post_tags enable row level security;


-- ==========================================
-- Admin Check Function (Bypasses RLS)
-- ==========================================
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Profiles policies
create policy "Allow public read access to admin profiles" on public.profiles
    for select using (true);

create policy "Allow users to update their own profile" on public.profiles
    for update using (auth.uid() = id);

create policy "Allow admins to manage all profiles" on public.profiles
    for all using (public.is_admin());

-- Posts policies
create policy "Allow public read access to published posts" on public.posts
    for select using (status = 'published');

create policy "Allow admins full access to posts" on public.posts
    for all using (public.is_admin());

-- Post Translations policies
create policy "Allow public read access to published post translations" on public.post_translations
    for select using (
        exists (
            select 1 from public.posts
            where posts.id = post_translations.post_id and posts.status = 'published'
        )
    );

create policy "Allow admins full access to post translations" on public.post_translations
    for all using (public.is_admin());

-- Categories policies
create policy "Allow public read access to categories" on public.categories
    for select using (true);

create policy "Allow admins full access to categories" on public.categories
    for all using (public.is_admin());

-- Category Translations policies
create policy "Allow public read access to category translations" on public.category_translations
    for select using (true);

create policy "Allow admins full access to category translations" on public.category_translations
    for all using (public.is_admin());

-- Tags policies
create policy "Allow public read access to tags" on public.tags
    for select using (true);

create policy "Allow admins full access to tags" on public.tags
    for all using (public.is_admin());

-- Tag Translations policies
create policy "Allow public read access to tag translations" on public.tag_translations
    for select using (true);

create policy "Allow admins full access to tag translations" on public.tag_translations
    for all using (public.is_admin());

-- Post Tags policies
create policy "Allow public read access to post tags" on public.post_tags
    for select using (true);

create policy "Allow admins full access to post tags" on public.post_tags
    for all using (public.is_admin());


-- ==========================================
-- TRIGGERS AND FUNCTIONS
-- ==========================================

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Set triggers for updated_at
create trigger update_profiles_updated_at before update on public.profiles
    for each row execute function public.handle_updated_at();

create trigger update_categories_updated_at before update on public.categories
    for each row execute function public.handle_updated_at();

create trigger update_posts_updated_at before update on public.posts
    for each row execute function public.handle_updated_at();


-- Trigger to handle auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    -- Make the first user an admin automatically for easier local setup
    case when not exists (select 1 from public.profiles) then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger auth user signups
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ==========================================
-- SEED DATA (Testing & Development)
-- ==========================================

-- 1. Insert Default Categories
insert into public.categories (id, slug) values
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a1', 'crypto-tips'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a2', 'tech-tricks'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a3', 'web3-guides'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a4', 'security-notes')
on conflict (id) do nothing;

insert into public.category_translations (category_id, locale, name, description) values
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a1', 'en', 'Crypto Tips', 'Actionable advice and quick tips for navigating crypto markets.'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a1', 'vi', 'Mẹo Crypto', 'Lời khuyên thực tế và mẹo nhanh khi tham gia thị trường crypto.'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a2', 'en', 'Tech Tricks', 'Advanced programming and command-line tips for web3 builders.'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a2', 'vi', 'Thủ thuật Công nghệ', 'Kỹ thuật lập trình và câu lệnh nâng cao cho các nhà phát triển web3.'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a3', 'en', 'Web3 Guides', 'Step-by-step documentation on smart contracts and blockchain DApps.'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a3', 'vi', 'Hướng dẫn Web3', 'Tài liệu hướng dẫn từng bước về hợp đồng thông minh và DApp.'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a4', 'en', 'Security Notes', 'Crucial alerts, smart contract audits, and key security practices.'),
('c1a80c9e-5e36-4d51-9c3f-4dfdfa4501a4', 'vi', 'Ghi chú Bảo mật', 'Cảnh báo quan trọng, kiểm định smart contract và bảo mật ví.')
on conflict (category_id, locale) do nothing;

-- 2. Insert Default Tags
insert into public.tags (id, slug) values
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b1', 'bitcoin'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b2', 'ethereum'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b3', 'solidity'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b4', 'security')
on conflict (id) do nothing;

insert into public.tag_translations (tag_id, locale, name) values
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b1', 'en', 'Bitcoin'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b1', 'vi', 'Bitcoin'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b2', 'en', 'Ethereum'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b2', 'vi', 'Ethereum'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b3', 'en', 'Solidity'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b3', 'vi', 'Solidity'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b4', 'en', 'Security'),
('t1a80c9e-5e36-4d51-9c3f-4dfdfa4501b4', 'vi', 'Bảo mật')
on conflict (tag_id, locale) do nothing;
