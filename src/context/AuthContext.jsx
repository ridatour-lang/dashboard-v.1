import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────
// Context Definition
// ─────────────────────────────────────────────
const AuthContext = createContext(null)

// ─────────────────────────────────────────────
// RBAC: Tab visibility per role
// ─────────────────────────────────────────────
export const TAB_PERMISSIONS = {
  katalog:  ['super_admin', 'operations', 'sales', 'admin_cabang'],
  booking:  ['super_admin', 'operations', 'support', 'sales', 'admin_cabang'],
  b2b:      ['super_admin', 'finance'],
  user:     ['super_admin'],
}

export const ROLE_LABELS = {
  super_admin: 'Super Administrator',
  operations:  'Product Operations',
  finance:     'Finance Admin',
  support:     'Customer Support',
  sales:       'Sales Staff',
  admin_cabang: 'Admin Cabang',
}

// ─────────────────────────────────────────────
// Helper: Ambil role dari tabel tb_users
// ─────────────────────────────────────────────
async function fetchUserRole(supabaseUid) {
  const { data, error } = await supabase
    .from('tb_users')
    .select('role, is_active, full_name, avatar_url')
    .eq('supabase_uid', supabaseUid)
    .single()

  if (error || !data) return null
  return data
}

// ─────────────────────────────────────────────
// AuthProvider Component
// ─────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(undefined) // undefined = loading
  const [userMeta, setUserMeta] = useState(null)       // { role, is_active, full_name, avatar_url }
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // Resolve full user profile (session + role dari DB)
  const resolveUser = useCallback(async (sess) => {
    if (!sess?.user) {
      setSession(null)
      setUserMeta(null)
      setLoading(false)
      return
    }

    setSession(sess)

    const meta = await fetchUserRole(sess.user.id)

    if (!meta) {
      // User belum ada di tb_users (trigger belum jalan) — tunggu sebentar lalu retry
      await new Promise(r => setTimeout(r, 1500))
      const retryMeta = await fetchUserRole(sess.user.id)

      if (!retryMeta) {
        setError('Akun Anda tidak ditemukan di direktori portal. Hubungi Super Admin.')
        await supabase.auth.signOut()
        setSession(null)
        setUserMeta(null)
        setLoading(false)
        return
      }
      setUserMeta(retryMeta)
    } else {
      setUserMeta(meta)
    }

    if (meta && !meta.is_active) {
      setError('Akun Anda telah dinonaktifkan. Hubungi Super Admin KianGroup.')
      await supabase.auth.signOut()
      setSession(null)
      setUserMeta(null)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    // Ambil sesi saat ini
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      resolveUser(sess)
    })

    // Dengarkan perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      resolveUser(sess)
    })

    return () => subscription.unsubscribe()
  }, [resolveUser])

  // ── Actions ──────────────────────────────────
  const signInWithGoogle = async () => {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })
    if (signInError) setError(signInError.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUserMeta(null)
    setError(null)
  }

  const canAccess = useCallback((tabId) => {
    if (!userMeta?.role) return false
    return (TAB_PERMISSIONS[tabId] || []).includes(userMeta.role)
  }, [userMeta])

  const clearError = () => setError(null)

  // ── Computed values ──────────────────────────
  const user = session?.user ?? null
  const role = userMeta?.role ?? null
  const displayName = userMeta?.full_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Pengguna'
  const avatarUrl = userMeta?.avatar_url
    || user?.user_metadata?.avatar_url
    || null

  const value = {
    session,
    user,
    role,
    displayName,
    avatarUrl,
    loading,
    error,
    signInWithGoogle,
    signOut,
    canAccess,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────
// useAuth Hook
// ─────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan di dalam <AuthProvider>')
  return ctx
}
