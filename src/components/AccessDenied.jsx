import React from 'react'
import { ShieldX, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AccessDenied({ tabName = 'halaman ini' }) {
  const { signOut, displayName } = useAuth()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <ShieldX className="w-8 h-8" style={{ color: '#EF4444' }}/>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#1E0B35' }}>Akses Ditolak</h2>
      <p className="text-sm leading-relaxed mb-1" style={{ color: '#9B8DB0', maxWidth: 360 }}>
        Halo, <span className="font-semibold" style={{ color: '#1E0B35' }}>{displayName}</span>. Role Anda tidak memiliki izin untuk mengakses <strong>{tabName}</strong>.
      </p>
      <p className="text-xs mt-1 mb-8" style={{ color: '#C4B0D8' }}>
        Hubungi Super Admin KianGroup untuk meminta perubahan hak akses.
      </p>
      <button onClick={signOut}
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
