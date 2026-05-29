# killerwhaleslabs 🐋

`killerwhaleslabs` is a clean, minimal, high-performance crypto content platform built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Supabase**. It provides deep-dive crypto research, tech tricks, Web3 Guides, and security notes with full bilingual routing (**Vietnamese & English**) and a secure admin dashboard.

---

## ⚡ Key Highlights
* **Bilingual System (vi / en):** Full SEO-friendly locale routing (`/en`, `/vi`, `/en/blog`, `/vi/blog`, `/en/blog/[slug]`, `/vi/blog/[slug]`) with independent translations, alternate links, and dynamic SEO titles.
* **Unified Data Layer:** Fully functional local memory fallback (Demo Mode) if Supabase keys are not set, allowing complete local development out-of-the-box.
* **Database Filtration:** Category and tag filters are pushed directly to the Supabase PostgreSQL layer using inner joins instead of client-side loops.
* **Fast Static Pages (SSG):** Article pages are statically pre-rendered during build time using `generateStaticParams()`, resulting in near-instant load speeds.
* **OLED Dark Theme:** Custom premium dark mode using Orbitron (headings) and Exo 2 (body) font styles, styled widgets, and smooth micro-animations.
* **Image Optimization:** Uses Next.js native `<Image />` component with configured remote domains to ensure lazy loading, WebP translation, and optimal image sizes.
* **Lightweight Markdown:** Features a custom, highly performant React-based Markdown parser to avoid heavy external library bundles.

---

## 🔒 Security & Protection
1. **Server Actions (BFF):** Admin actions are securely executed via Server Actions ([actions.ts](file:///home/vity/project/src/app/actions.ts)), isolating server-only cookies and tokens from browser client bundles.
2. **Rate Limiting:** Protects the login portal using an in-memory rolling rate limiter (locks users out for 15 minutes after 5 consecutive failures).
3. **Server-side Validation:** Standardizes and strips slug inputs, and validates that cover image URLs use a secure `https://` protocol scheme to prevent malicious URL injection exploits.
4. **Supabase RLS Policies:** Strict PostgreSQL policies ensure anonymous/public clients only read `published` articles, while `admin` users hold full write privileges.

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have `Node.js` (v18+) and `npm` installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally (Demo Mode)
If you do not have Supabase credentials set up, the application detects the placeholders in `.env` and boots in **Demo Mode**. All data is saved in server memory, allowing you to test the entire site without database setups!

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

#### 🔐 Demo Admin Access:
* **Route:** `/en/studio` or `/vi/studio` (Discrete padlock link in the bottom-right footer).
* **Email:** `admin@killerwhaleslabs.com`
* **Password:** `password` (Locked out for 15 minutes after 5 failed attempts).

---

## ⚙️ Connecting Your Supabase Project

To transition from Demo Mode to production Supabase:

1. Create a project at [Supabase](https://supabase.com).
2. Go to **SQL Editor** in Supabase and paste the contents of [supabase/schema.sql](file:///home/vity/project/supabase/schema.sql) to build tables, triggers, and RLS policies.
3. Replace the variables in your local `.env` file (copied from `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-api-key
   SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key
   ```
4. Create an admin user:
   * Sign up a user through the dashboard, or create one in the Supabase Auth panel.
   * In the `profiles` table in Supabase, update that user's record setting `role = 'admin'`.
5. Restart your local server: `npm run dev`.

---

## 📁 Project Structure
```text
├── design-system/          # Design specifications from UI UX Pro Max skill
├── supabase/               # PostgreSQL schema & RLS migrations script
├── src/
│   ├── app/
│   │   ├── actions.ts      # Server Actions (auth checking, rate-limiter, database writes)
│   │   ├── globals.css     # CSS Variables & custom dark theme
│   │   └── [lang]/         # Bilingual routes
│   │       ├── layout.tsx  # Dynamic root layout
│   │       ├── dictionaries.ts # Translation loader
│   │       ├── (public)/   # Public website routes
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx
│   │       │   └── blog/
│   │       └── studio/     # Administrative studio routes
│   ├── components/         # Shared visual components (Header, Footer, Markdown)
│   ├── dictionaries/       # JSON localization dictionaries
│   ├── types/              # Type definitions
│   └── utils/
│       └── supabase/       # Supabase client / server setup
```

---

## 🤖 Deployment Target
Perfect for **Vercel** or **Cloudflare Pages**. When compiling, the static segments will build and dynamic pages (such as posts from Supabase or Admin Session cookies) will run under SSR seamlessly.
