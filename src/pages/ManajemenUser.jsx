import React from 'react'
import { ShieldAlert, ShieldCheck, UserCheck, UserX } from 'lucide-react'
import { StatusBadge } from '../components/ui/index.jsx'
import { ROLE_LABELS } from '../context/AuthContext'

const MOCK_USERS = [
  { id: 1, name: 'Erik Julianto',  email: 'erik.julianto@kiangroup.com', role: 'super_admin', provider: 'Google Workspace',   last_active: 'Baru saja',    status: 'Active'    },
  { id: 2, name: 'Sarah Wijaya',   email: 'sarah.w@kiangroup.com',       role: 'support',     provider: 'Google Workspace',   last_active: '15 menit lalu', status: 'Active'    },
  { id: 3, name: 'Rian Hidayat',   email: 'rian.h@kiangroup.com',        role: 'operations',  provider: 'Google Workspace',   last_active: '2 jam lalu',    status: 'Active'    },
  { id: 4, name: 'Jessica Lim',    email: 'jessica.l@kiangroup.com',     role: 'finance',     provider: 'Google Workspace',   last_active: '1 hari lalu',   status: 'Suspended' },
]

const ROLE_BADGE_STYLE = {
  super_admin:  { bg: 'rgba(123,45,139,0.1)',  border: 'rgba(123,45,139,0.25)', color: '#7B2D8B' },
  operations:   { bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.25)', color: '#B8760A' },
  finance:      { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)',  color: '#2563EB' },
  support:      { bg: 'rgba(107,114,128,0.08)',border: 'rgba(107,114,128,0.2)', color: '#6B7280' },
  sales:        { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)',  color: '#DB2777' },
  admin_cabang: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',  color: '#7C3AED' },
}

export default function ManajemenUser() {
  const activeCount    = MOCK_USERS.filter(u => u.status === 'Active').length
  const suspendedCount = MOCK_USERS.filter(u => u.status === 'Suspended').length

  return (
    <div>
      {/* Header */}
      <div className="mb-8 pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Manajemen User (SSO Gatekeeper)</h2>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold"
            style={{ background: 'rgba(123,45,139,0.1)', border: '1px solid rgba(123,45,139,0.25)', color: '#7B2D8B' }}>
            SSO AKTIF
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Kelola hak akses administrator dan staf operasional KianGroup. Login diamankan dengan Google SSO Perusahaan.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Pengguna', value: MOCK_USERS.length, icon: <ShieldCheck className="w-4 h-4" style={{ color: '#7B2D8B' }} /> },
          { label: 'Akun Aktif',     value: activeCount,       icon: <UserCheck  className="w-4 h-4" style={{ color: '#7B2D8B' }} /> },
          { label: 'Akun Suspended', value: suspendedCount,    icon: <UserX      className="w-4 h-4" style={{ color: '#EF4444' }} /> },
          { label: 'Provider',       value: 'Google SSO',      icon: <ShieldAlert className="w-4 h-4" style={{ color: '#F5A623' }} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="p-4 rounded-xl border flex items-center space-x-3"
            style={{ background: '#FFFFFF', borderColor: '#EAE3F5' }}>
            <div className="flex-shrink-0">{icon}</div>
            <div>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>{label}</p>
              <p className="font-bold text-sm mt-0.5" style={{ color: '#1A1A1A' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security info box */}
      <div className="flex items-start space-x-4 p-5 rounded-xl border mb-6"
        style={{ background: 'rgba(245,166,35,0.05)', borderColor: 'rgba(245,166,35,0.2)' }}>
        <div className="p-2 rounded-lg flex-shrink-0"
          style={{ background: 'rgba(123,45,139,0.1)', border: '1px solid rgba(123,45,139,0.2)' }}>
          <ShieldAlert className="w-5 h-5" style={{ color: '#7B2D8B' }} />
        </div>
        <div>
          <h4 className="font-bold text-sm mb-1" style={{ color: '#1A1A1A' }}>Kebijakan Keamanan SSO Perusahaan</h4>
          <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
            Semua akses staf operasional wajib melalui panel integrasi Google SSO. Admin tidak dapat membuat user lokal non-SSO
            untuk menghindari celah keamanan data. User yang dinonaktifkan di Google Workspace akan otomatis kehilangan akses
            dashboard ini dalam 60 detik.
          </p>
        </div>
      </div>

      {/* User Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: '#F3F4F6', background: '#FAFAFA' }}>
          <span className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Direktori Pengguna Dashboard</span>
          <button className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
            style={{ background: '#7B2D8B', color: '#FFFFFF' }}>
            Undang User via SSO Portal
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: '#F9F7FE', borderBottom: '1px solid #EAE3F5' }}>
                {['Nama Lengkap','Role Akses','Penyedia SSO Identity','Aktivitas Terakhir','Status Akses','Aksi'].map(h => (
                  <th key={h} className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map(u => {
                const rs = ROLE_BADGE_STYLE[u.role] || ROLE_BADGE_STYLE.support
                return (
                  <tr key={u.id} className="table-row-hover border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3.5 px-5">
                      <span className="font-medium text-sm block" style={{ color: '#1A1A1A' }}>{u.name}</span>
                      <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{u.email}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: rs.bg, border: `1px solid ${rs.border}`, color: rs.color }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7B2D8B' }} />
                        <span className="text-sm" style={{ color: '#374151' }}>{u.provider}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs" style={{ color: '#9CA3AF' }}>{u.last_active}</td>
                    <td className="py-3.5 px-5"><StatusBadge status={u.status} /></td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => alert(`Audit log untuk ${u.name}...`)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                        style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FAF8FF' }}
                      >
                        Audit Log
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
