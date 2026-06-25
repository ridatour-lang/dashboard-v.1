import React from 'react'
import { ShieldX, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AccessDenied({ tabName = 'halaman ini' }) {
  const { signOut, displayName } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8">

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <ShieldX className="w-8 h-8" style={{ color: '#EF4444' }}/>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold mb-2" style={{ color: '#1E0B35' }}>Akses Ditolak</h2>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-1" style={{ color: '#9B8DB0', maxWidth: 380 }}>
        Halo, <span className="font-semibold" style={{ color: '#1E0B35' }}>{displayName}</span>.
        {' '}Role Anda belum memiliki izin untuk mengakses <strong>{tabName}</strong>.
      </p>

      {/* Contact info — same style as pending screen */}
      <div className="mt-4 mb-6 space-y-1">
        <p className="text-xs" style={{ color: '#C4B0D8' }}>
          Butuh bantuan? Hubungi Admin untuk perubahan hak akses:
        </p>
        <a
          href="https://wa.me/62818970910"
          target="_blank"
          rel="noreferrer"
          className="block text-xs font-bold transition-opacity hover:opacity-75"
          style={{ color: '#4ADE80' }}
        >
          WA +62 818-970-910
        </a>
        <a
          href="mailto:erik.julian@ridatour.co.id"
          className="block text-[11px] transition-opacity hover:opacity-75"
          style={{ color: '#9B8DB0' }}
        >
          erik.julian@ridatour.co.id
        </a>
      </div>

      {/* Sign out button */}
      <button
        onClick={signOut}
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        style={{ background: '#F3EFF9', color: '#7B2D8B', border: '1px solid #E0D1F0' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#7B2D8B'; e.currentTarget.style.color = '#FFFFFF' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#F3EFF9'; e.currentTarget.style.color = '#7B2D8B' }}
      >
        <LogIn className="w-4 h-4"/>
        <span>Ganti Akun</span>
      </button>
    </div>
  )
}
