import React from 'react'
import { KeyRound, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── Official Google G SVG ────────────────────────────────────
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

// ── RiDATOUR Logo Mark (SVG) ─────────────────────────────────
function RiDATOURLogo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      {/* Circle background */}
      <circle cx="40" cy="40" r="40" fill="#7B2D8B"/>
      {/* Plane icon — simplified */}
      <g transform="translate(40,40) rotate(-30)" fill="white">
        <path d="M0,-14 L4,-2 L16,2 L4,4 L3,12 L0,9 L-3,12 L-4,4 L-16,2 L-4,-2 Z" opacity="0.9"/>
      </g>
      {/* RT text */}
      <text x="40" y="62" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="800"
        fontSize="11" fill="#F5A623" letterSpacing="2">
        RiDA
      </text>
    </svg>
  )
}

// ── Grid pattern — subtle ────────────────────────────────────
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

// ── Decorative floating orbs ─────────────────────────────────
function FloatingOrbs() {
  return (
    <>
      {/* Top-right gold orb */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 65%)', filter: 'blur(32px)' }}
      />
      {/* Bottom-left purple orb */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,45,139,0.28) 0%, transparent 65%)', filter: 'blur(40px)' }}
      />
      {/* Center top subtle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', filter: 'blur(24px)' }}
      />
    </>
  )
}

// ── Main Login Page ──────────────────────────────────────────
export default function LoginPage() {
  const { signInWithGoogle, loading, error, clearError } = useAuth()

  const handleSignIn = async () => {
    clearError()
    await signInWithGoogle()
  }

  return (
    <div className="login-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <GridPattern />
      <FloatingOrbs />

      {/* ── Login Card ── */}
      <div
        className="login-card relative z-10 w-full max-w-sm"
        style={{ borderRadius: 24, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', padding: '44px 36px 36px' }}
      >
        {/* Gold top accent line */}
        <div className="absolute top-0 left-8 right-8 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #F5A623 40%, #F5A623 60%, transparent)', opacity: 0.7 }}
        />

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-5 drop-shadow-xl">
            <RiDATOURLogo size={72} />
          </div>
          <h1 className="text-[22px] font-bold text-white text-center tracking-tight leading-snug">
            Sistem Administrasi<br />
            <span style={{ color: '#F5A623' }}>Back-Office RiDATOUR</span>
          </h1>
          <p className="text-sm mt-2 text-center" style={{ color: 'rgba(201,184,224,0.7)' }}>
            Akses khusus untuk tim internal KianGroup
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-6 space-x-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(123,45,139,0.3)' }}/>
          <div className="flex items-center space-x-1.5" style={{ color: '#6B5880' }}>
            <KeyRound className="w-3 h-3"/>
            <span className="text-[11px] font-semibold uppercase tracking-widest">SSO Gate</span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'rgba(123,45,139,0.3)' }}/>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start space-x-2.5 mb-5 p-3.5 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F87171' }}/>
            <p className="text-xs leading-relaxed" style={{ color: '#FCA5A5' }}>{error}</p>
          </div>
        )}

        {/* Google SSO Button */}
        <button
          id="btn-google-sso"
          onClick={handleSignIn}
          disabled={loading}
          className="google-btn w-full flex items-center justify-center space-x-3 py-3.5 px-5 rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          }}
        >
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }}/>
            : <GoogleIcon size={20}/>
          }
          <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
        </button>

        {/* Note */}
        <p className="text-center text-[11px] mt-5 leading-relaxed" style={{ color: '#6B5880' }}>
          Hanya akun Google yang terdaftar dalam direktori KianGroup yang dapat mengakses sistem ini.
        </p>
      </div>

      {/* ── Footer ── */}
      <p className="absolute bottom-5 text-[11px] text-center z-10"
        style={{ color: 'rgba(107,88,128,0.55)', fontFamily: 'monospace' }}>
        Portal RiDATOUR v1.0 &mdash; KianGroup &copy; {new Date().getFullYear()}
      </p>
    </div>
  )
}
