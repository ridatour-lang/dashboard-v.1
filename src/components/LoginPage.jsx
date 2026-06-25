import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  KeyRound, AlertCircle, Loader2,
  User, Phone, Clock, LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── Constants ────────────────────────────────
const POLL_INTERVAL_MS  = 15_000        // cek setiap 15 detik
const SESSION_TIMEOUT_S = 30 * 60       // 30 menit dalam detik

// ── Official Google G SVG ────────────────────
function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ── RiDATOUR Logo Mark ───────────────────────
function RiDATOURLogo({ size = 64 }) {
  return (
    <img
      src="/logo.png"
      alt="RiDATOUR Logo"
      className="rounded-full object-cover mx-auto"
      style={{
        width: size,
        height: size,
        boxShadow: '0 0 20px rgba(123,45,139,0.3)',
      }}
    />
  )
}

// ── Grid pattern ─────────────────────────────
function GridPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#A855F7" strokeWidth="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    </svg>
  )
}

// ── Floating orbs ────────────────────────────
function FloatingOrbs() {
  return (
    <>
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 65%)', filter: 'blur(32px)' }}
      />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,45,139,0.28) 0%, transparent 65%)', filter: 'blur(40px)' }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', filter: 'blur(24px)' }}
      />
    </>
  )
}

// ── Input field helper ───────────────────────
function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div>
      <label className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>
        {Icon && <Icon className="w-3 h-3" />}
        <span>{label} <span style={{ color: '#EF4444' }}>*</span></span>
      </label>
      <input
        className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
        style={{
          background:  'rgba(255,255,255,0.06)',
          border:      `1px solid ${error ? '#EF444488' : 'rgba(123,45,139,0.35)'}`,
          color:       '#FFFFFF',
        }}
        {...props}
      />
      {error && (
        <p className="flex items-center space-x-1 mt-1 text-[11px]" style={{ color: '#F87171' }}>
          <AlertCircle className="w-3 h-3 flex-shrink-0" /><span>{error}</span>
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main LoginPage Component
// ─────────────────────────────────────────────
export default function LoginPage() {
  const {
    signInWithGoogle, signOut, loading, error, clearError,
    pendingUser, pendingApproval,
    completeRegistration, recheckApproval,
  } = useAuth()

  // ── Form state (complete_profile screen) ────
  const [fullName,   setFullName]   = useState('')
  const [phone,      setPhone]      = useState('')
  const [nameErr,    setNameErr]    = useState('')
  const [phoneErr,   setPhoneErr]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [regError,   setRegError]   = useState('')

  // ── Polling state (pending_approval screen) ─
  const [countdown,  setCountdown]  = useState(SESSION_TIMEOUT_S)
  const [timedOut,   setTimedOut]   = useState(false)
  const pollRef      = useRef(null)
  const tickRef      = useRef(null)

  // Pre-fill nama dari Google saat pendingUser muncul
  useEffect(() => {
    if (pendingUser) {
      setFullName(pendingUser.full_name || '')
      setPhone('')
      setNameErr('')
      setPhoneErr('')
      setRegError('')
    }
  }, [pendingUser])

  // ── Polling logic: mulai saat pendingApproval = true ─
  const startPolling = useCallback(() => {
    setCountdown(SESSION_TIMEOUT_S)
    setTimedOut(false)

    // Countdown ticker (setiap 1 detik)
    tickRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tickRef.current)
          clearInterval(pollRef.current)
          setTimedOut(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // DB poll (setiap 15 detik)
    pollRef.current = setInterval(async () => {
      const approved = await recheckApproval()
      if (approved) {
        clearInterval(pollRef.current)
        clearInterval(tickRef.current)
        // resolveUser sudah dipanggil di dalam recheckApproval → dashboard muncul otomatis
      }
    }, POLL_INTERVAL_MS)
  }, [recheckApproval])

  useEffect(() => {
    if (pendingApproval) {
      startPolling()
    } else {
      clearInterval(pollRef.current)
      clearInterval(tickRef.current)
    }
    return () => {
      clearInterval(pollRef.current)
      clearInterval(tickRef.current)
    }
  }, [pendingApproval, startPolling])

  // Auto sign-out setelah timeout
  useEffect(() => {
    if (timedOut) {
      const t = setTimeout(() => signOut(), 2500)
      return () => clearTimeout(t)
    }
  }, [timedOut, signOut])

  // ── Handlers ────────────────────────────────
  const handleGoogleSignIn = () => { clearError(); signInWithGoogle() }

  const handleSubmitProfile = async (e) => {
    e.preventDefault()
    setNameErr('')
    setPhoneErr('')
    setRegError('')

    let valid = true
    if (!fullName.trim()) { setNameErr('Nama lengkap wajib diisi.'); valid = false }
    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 8) { setPhoneErr('Nomor WhatsApp tidak valid (min. 8 digit).'); valid = false }
    if (!valid) return

    setSubmitting(true)
    const { success, error: err } = await completeRegistration(fullName, cleanPhone)
    setSubmitting(false)
    if (!success) setRegError(err)
  }

  // ── Computed ─────────────────────────────────
  const mm          = String(Math.floor(countdown / 60)).padStart(2, '0')
  const ss          = String(countdown % 60).padStart(2, '0')
  const progressPct = (countdown / SESSION_TIMEOUT_S) * 100
  const isLow       = countdown < 300   // merah saat < 5 menit

  const screen = pendingApproval ? 'pending_approval'
               : pendingUser     ? 'complete_profile'
               : 'idle'

  // ─────────────────────────────────────────────
  return (
    <div className="login-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <GridPattern />
      <FloatingOrbs />

      {/* ── Login Card ── */}
      <div
        className="login-card relative z-10 w-full max-w-sm"
        style={{ borderRadius: 24, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', padding: '40px 34px 34px' }}
      >
        {/* Gold accent line */}
        <div className="absolute top-0 left-8 right-8 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #F5A623 40%, #F5A623 60%, transparent)', opacity: 0.7 }}
        />

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-7">
          <div className="mb-4 drop-shadow-xl"><RiDATOURLogo size={68} /></div>
          <h1 className="text-[20px] font-bold text-white text-center tracking-tight leading-snug">
            Sistem Administrasi<br />
            <span style={{ color: '#F5A623' }}>Back-Office RiDATOUR</span>
          </h1>
        </div>

        {/* ════ SCREEN: idle ════ */}
        {screen === 'idle' && (
          <div className="fade-in">
            <div className="flex items-center mb-6 space-x-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(123,45,139,0.3)' }}/>
              <div className="flex items-center space-x-1.5" style={{ color: '#6B5880' }}>
                <KeyRound className="w-3 h-3"/>
                <span className="text-[11px] font-semibold uppercase tracking-widest">SSO Gate</span>
              </div>
              <div className="flex-1 h-px" style={{ background: 'rgba(123,45,139,0.3)' }}/>
            </div>

            {error && (
              <div className="flex items-start space-x-2.5 mb-5 p-3.5 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F87171' }}/>
                <p className="text-xs leading-relaxed" style={{ color: '#FCA5A5' }}>{error}</p>
              </div>
            )}

            <button
              id="btn-google-sso"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="google-btn w-full flex items-center justify-center space-x-3 py-3.5 px-5 rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#FFFFFF', color: '#1F2937', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }}/>
                : <GoogleIcon size={20}/>
              }
              <span>{loading ? 'Menghubungkan...' : 'Continue with Google'}</span>
            </button>

            <p className="text-center text-[11px] mt-5 leading-relaxed" style={{ color: '#6B5880' }}>
              Hanya akun Google yang terdaftar dalam direktori RiDATOUR yang dapat mengakses sistem ini.
            </p>
          </div>
        )}

        {/* ════ SCREEN: complete_profile ════ */}
        {screen === 'complete_profile' && (
          <form onSubmit={handleSubmitProfile} className="fade-in space-y-4">
            {/* Info banner */}
            <div className="p-3.5 rounded-xl" style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.2)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#F5A623' }}>
                Akun baru terdeteksi
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(201,184,224,0.65)' }}>
                Email{' '}
                <span className="font-mono" style={{ color: '#E2D5F8' }}>{pendingUser?.email}</span>{' '}
                belum terdaftar. Lengkapi profil Anda untuk mengajukan akses.
              </p>
            </div>

            <Field
              label="Nama Lengkap"
              icon={User}
              type="text"
              value={fullName}
              onChange={e => { setFullName(e.target.value); setNameErr('') }}
              placeholder="Masukkan nama asli Anda"
              error={nameErr}
              autoFocus
            />

            <Field
              label="Nomor WhatsApp"
              icon={Phone}
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setPhoneErr('') }}
              placeholder="Contoh: 08123456789"
              error={phoneErr}
            />

            {regError && (
              <div className="flex items-start space-x-2 p-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#F87171' }}/>
                <p className="text-xs" style={{ color: '#FCA5A5' }}>{regError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7B2D8B 0%, #9B3AAE 100%)', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(123,45,139,0.35)' }}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? 'Mengirim...' : 'Kirim Permintaan Akses'}</span>
            </button>

            <button
              type="button"
              onClick={signOut}
              className="w-full text-center text-[11px] py-1.5 cursor-pointer transition-colors"
              style={{ color: '#6B5880' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9CA3AF' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6B5880' }}
            >
              Masuk dengan akun lain
            </button>
          </form>
        )}

        {/* ════ SCREEN: pending_approval ════ */}
        {screen === 'pending_approval' && (
          <div className="fade-in">
            {timedOut ? (
              /* Timeout state */
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Clock className="w-7 h-7" style={{ color: '#F87171' }}/>
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: '#FCA5A5' }}>Sesi habis</p>
                <p className="text-xs leading-relaxed" style={{ color: '#6B5880' }}>
                  Mengalihkan ke halaman login...
                </p>
              </div>
            ) : (
              /* Waiting state */
              <>
                {/* Amber card */}
                <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.22)' }}>
                  {/* Icon + title */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(245,166,35,0.14)', border: '1px solid rgba(245,166,35,0.25)' }}>
                      <Clock className="w-4 h-4" style={{ color: '#F5A623' }}/>
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight" style={{ color: '#F5A623' }}>
                        Menunggu Verifikasi
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(201,184,224,0.6)' }}>
                        Permintaan akses Anda sedang ditinjau Admin
                      </p>
                    </div>
                  </div>

                  {/* Countdown progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px]" style={{ color: '#6B5880' }}>Sesi berlaku</span>
                      <span
                        className="text-[11px] font-mono font-bold tabular-nums"
                        style={{ color: isLow ? '#F87171' : '#F5A623' }}
                      >
                        {mm}:{ss}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(107,88,128,0.25)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width:      `${progressPct}%`,
                          background: isLow
                            ? 'linear-gradient(90deg, #EF4444, #F97316)'
                            : 'linear-gradient(90deg, #F5A623, #FBBF24)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="text-center mb-5 space-y-1">
                  <p className="text-[11px]" style={{ color: 'rgba(201,184,224,0.45)' }}>
                    Butuh bantuan? Hubungi Admin:
                  </p>
                  <a
                    href="https://wa.me/62818970910"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs font-bold transition-opacity hover:opacity-80"
                    style={{ color: '#4ADE80' }}
                  >
                    WA +62 818-970-910
                  </a>
                  <a
                    href="mailto:erik.julian@ridatour.co.id"
                    className="block text-[11px] transition-opacity hover:opacity-80"
                    style={{ color: '#6B5880' }}
                  >
                    erik.julian@ridatour.co.id
                  </a>
                </div>

                {/* Sign out button */}
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-colors"
                  style={{ borderColor: 'rgba(107,88,128,0.3)', color: '#6B5880', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(107,88,128,0.5)'; e.currentTarget.style.color = '#9CA3AF' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(107,88,128,0.3)'; e.currentTarget.style.color = '#6B5880' }}
                >
                  <LogOut className="w-3.5 h-3.5"/>
                  <span>Masuk dengan Akun Lain</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 text-[11px] text-center z-10"
        style={{ color: 'rgba(107,88,128,0.55)', fontFamily: 'monospace' }}>
        Portal RiDATOUR v1.0 &mdash; KianGroup &copy; {new Date().getFullYear()}
      </p>
    </div>
  )
}
