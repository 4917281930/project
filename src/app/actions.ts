'use server'

import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'

const DEMO_EMAIL = 'admin@killerwhaleslabs.com'
const DEMO_PASSWORD = 'password'
const SESSION_COOKIE_NAME = 'kwl_admin_session'

// rolling login attempts rate limiter state
const loginAttempts = new Map<string, { count: number; lockUntil: number }>()

// Check if we are running in demo mode
const isDemo = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('placeholder') || key.includes('placeholder')
}

// Check and register login rate-limits
function checkRateLimit(key: string): { limited: boolean; timeLeft?: number } {
  const attempt = loginAttempts.get(key)
  if (!attempt) return { limited: false }

  const now = Date.now()
  if (attempt.lockUntil > now) {
    return { limited: true, timeLeft: Math.ceil((attempt.lockUntil - now) / 1000) }
  }

  // Lock expired
  if (attempt.lockUntil > 0 && attempt.lockUntil <= now) {
    loginAttempts.delete(key)
  }

  return { limited: false }
}

function registerLoginAttempt(key: string, success: boolean) {
  if (success) {
    loginAttempts.delete(key)
    return
  }

  const attempt = loginAttempts.get(key) || { count: 0, lockUntil: 0 }
  attempt.count += 1

  if (attempt.count >= 5) {
    attempt.lockUntil = Date.now() + 60 * 15 * 1000 // Lock for 15 minutes
  }

  loginAttempts.set(key, attempt)
}

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string || '').trim()
  const password = formData.get('password') as string
  const cookieStore = await cookies()
  const clientHeaders = await headers()
  const ip = clientHeaders.get('x-forwarded-for') || 'unknown-ip'
  
  // Rate limiting check
  const rateLimitKey = `${ip}:${email}`
  const limit = checkRateLimit(rateLimitKey)
  if (limit.limited) {
    return { 
      success: false, 
      error: `Too many failed attempts. Locked out. Try again in ${Math.ceil(limit.timeLeft! / 60)} minutes.` 
    }
  }

  if (isDemo()) {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      registerLoginAttempt(rateLimitKey, true)
      cookieStore.set(SESSION_COOKIE_NAME, 'demo-session-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'lax'
      })
      return { success: true }
    }
    registerLoginAttempt(rateLimitKey, false)
    return { success: false, error: 'Invalid admin credentials for Demo Mode.' }
  }

  // Real Supabase Auth Flow
  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      registerLoginAttempt(rateLimitKey, false)
      return { success: false, error: authError?.message || 'Authentication failed.' }
    }

    // Verify role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      // User is not an admin, sign out immediately
      await supabase.auth.signOut()
      registerLoginAttempt(rateLimitKey, false)
      return { success: false, error: 'Access denied: You do not have the admin role.' }
    }

    registerLoginAttempt(rateLimitKey, true)

    // Set server cookie session to flag login status for page checks
    cookieStore.set(SESSION_COOKIE_NAME, 'supabase-authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax'
    })

    return { success: true }
  } catch (error: any) {
    registerLoginAttempt(rateLimitKey, false)
    return { success: false, error: error.message || 'An unexpected error occurred.' }
  }
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  if (!session) return false

  if (isDemo()) {
    return session.value === 'demo-session-token'
  }

  // Real Supabase session check & Synchronization
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      try {
        cookieStore.delete(SESSION_COOKIE_NAME)
      } catch {}
      return false
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    if (!isAdmin) {
      try {
        cookieStore.delete(SESSION_COOKIE_NAME)
      } catch {}
    }
    return isAdmin
  } catch {
    try {
      cookieStore.delete(SESSION_COOKIE_NAME)
    } catch {}
    return false
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)

  if (!isDemo()) {
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error signing out of Supabase:', e)
    }
  }

  return { success: true }
}

// Server side validaton schema
function validatePostPayload(postPayload: any) {
  // Validate cover_image_url scheme to prevent javascript: and similar URL exploits
  if (postPayload.cover_image_url) {
    const urlStr = postPayload.cover_image_url.trim()
    if (urlStr !== '') {
      if (!urlStr.startsWith('https://')) {
        throw new Error('Security Error: Cover image must use a secure https:// URL scheme.')
      }
    }
  }

  // Validate slug
  if (!postPayload.slug) {
    throw new Error('Slug is required.')
  }
  const cleanSlug = postPayload.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  if (cleanSlug !== postPayload.slug) {
    throw new Error('Invalid slug format. Use only lowercase alphanumeric characters and hyphens.')
  }
}

export async function createPostAction(postPayload: any) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin credentials required.')
  }

  // Server side validation
  validatePostPayload(postPayload)

  // Verify unique slug duplicate checks
  const posts = await db.getPosts('en', { status: 'all' })
  if (posts.some(p => p.slug === postPayload.slug)) {
    throw new Error('Slug already exists. Please choose a unique URL slug.')
  }

  return db.createPost(postPayload)
}

export async function updatePostAction(id: string, postPayload: any) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin credentials required.')
  }

  // Server side validation
  validatePostPayload(postPayload)

  // Verify unique slug duplicate checks
  const posts = await db.getPosts('en', { status: 'all' })
  if (posts.some(p => p.slug === postPayload.slug && p.id !== id)) {
    throw new Error('Slug already exists. Please choose a unique URL slug.')
  }

  return db.updatePost(id, postPayload)
}

export async function deletePostAction(id: string) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin credentials required.')
  }
  return db.deletePost(id)
}
