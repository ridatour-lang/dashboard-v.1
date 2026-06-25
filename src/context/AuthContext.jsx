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
  super_admin:  'Super Administrator',
  operations:   'Product Operations',
  finance:      'Finance Admin',
  support:      'Customer Support',
  sales:        'Sales Staff',
  admin_cabang: 'Admin Cabang',
}

export const ALL_ROLES = Object.keys(ROLE_LABELS)

// ─────────────────────────────────────────────
// Helper: Ambil metadata user dari tb_users
// ─────────────────────────────────────────────
async function fetchUserMeta(supabaseUid) {
  const { data, error } = await supabase
    .from('tb_users')
    .select('role, is_active, full_name, avatar_url, phone')
    .eq('supabase_uid', supabaseUid)
    .single()
  if (error || !data) return null
  return data
}

// ─────────────────────────────────────────────
// AuthProvider Component
// ─────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [session,         setSession]         = useState(undefined)   // undefined = loading
  const [userMeta,        setUserMeta]         = useState(null)        // user aktif dari tb_users
  const [pendingUser,     setPendingUser]      = useState(null)        // Google auth OK, belum di tb_users
  const [pendingApproval, setPendingApproval]  = useState(false)       // di tb_users tapi is_active=FALSE
  const [loading,         setLoading]          = useState(true)
  const [error,           setError]            = useState(null)

  // ── Resolve user setelah session berubah ──────
  const resolveUser = useCallback(async (sess) => {
    if (!sess?.user) {
      setSession(null)
      setUserMeta(null)
      setPendingUser(null)
      setPendingApproval(false)
      setLoading(false)
      return
    }

    setSession(sess)
    const meta = await fetchUserMeta(sess.user.id)

    if (!meta) {
      // Email belum ada di tb_users sama sekali → tampilkan form lengkapi profil
      setPendingUser({
        uid:        sess.user.id,
        email:      sess.user.email,
        full_name:  sess.user.user_metadata?.full_name || '',
        avatar_url: sess.user.user_metadata?.avatar_url || null,
      })
      setUserMeta(null)
      setPendingApproval(false)
      setLoading(false)
      return
    }

    if (!meta.is_active) {
      // Ada di tb_users tapi belum diaktifkan super_admin → pending approval
      setPendingApproval(true)
      setPendingUser(null)
      setUserMeta(null)
      setLoading(false)
      return
    }

    // User aktif normal → masuk dashboard
    setUserMeta(meta)
    setPendingUser(null)
    setPendingApproval(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      resolveUser(sess)
    })
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
          prompt:      'select_account',
        },
      },
    })
    if (signInError) setError(signInError.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUserMeta(null)
    setPendingUser(null)
    setPendingApproval(false)
    setError(null)
  }

  // Dipanggil dari form "Lengkapi Profil" setelah user mengisi nama + WA
  const completeRegistration = async (fullName, phone) => {
    if (!session?.user) return { success: false, error: 'Sesi tidak ditemukan. Coba masuk ulang.' }

    const { error: insertError } = await supabase.from('tb_users').insert({
      supabase_uid: session.user.id,
      email:        session.user.email,
      full_name:    fullName.trim(),
      avatar_url:   session.user.user_metadata?.avatar_url || null,
      phone:        phone.trim(),
      role:         'support',
      is_active:    false,   // Menunggu aktivasi oleh super_admin
    })

    if (insertError) {
      return { success: false, error: 'Gagal mendaftar. Coba lagi atau hubungi Admin.' }
    }

    setPendingUser(null)
    setPendingApproval(true)
    return { success: true }
  }

  // Dipanggil oleh polling di LoginPage setiap 15 detik
  // Mengembalikan true jika akun sudah diaktifkan
  const recheckApproval = useCallback(async () => {
    if (!session?.user) return false
    const meta = await fetchUserMeta(session.user.id)
    if (meta?.is_active) {
      setUserMeta(meta)
      setPendingApproval(false)
      return true
    }
    return false
  }, [session])

  const canAccess = useCallback((tabId) => {
    if (!userMeta?.role) return false
    return (TAB_PERMISSIONS[tabId] || []).includes(userMeta.role)
  }, [userMeta])

  const clearError = () => setError(null)

  // ── Computed values ──────────────────────────
  const user        = session?.user ?? null
  const role        = userMeta?.role ?? null
  const displayName = userMeta?.full_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Pengguna'
  const avatarUrl = userMeta?.avatar_url
    || user?.user_metadata?.avatar_url
    || null

  return (
    <AuthContext.Provider value={{
      session,
      user,
      role,
      displayName,
      avatarUrl,
      loading,
      error,
      pendingUser,
      pendingApproval,
      signInWithGoogle,
      signOut,
      completeRegistration,
      recheckApproval,
      canAccess,
      clearError,
    }}>
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
