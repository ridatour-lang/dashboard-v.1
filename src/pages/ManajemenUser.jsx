import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldAlert, ShieldCheck, UserCheck, UserX,
  RefreshCw, Phone, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ROLE_LABELS, ALL_ROLES } from '../context/AuthContext'

// ─────────────────────────────────────────────
// Role badge colors
// ─────────────────────────────────────────────
const ROLE_BADGE_STYLE = {
  super_admin:  { bg: 'rgba(123,45,139,0.1)',  border: 'rgba(123,45,139,0.25)', color: '#7B2D8B' },
  operations:   { bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.25)', color: '#B8760A' },
  finance:      { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)',  color: '#2563EB' },
  support:      { bg: 'rgba(107,114,128,0.08)',border: 'rgba(107,114,128,0.2)', color: '#6B7280' },
  sales:        { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)',  color: '#DB2777' },
  admin_cabang: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',  color: '#7C3AED' },
}

// ─────────────────────────────────────────────
// Relative time helper
// ─────────────────────────────────────────────
function relativeTime(isoString) {
  if (!isoString) return '—'
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000
  if (diff < 60)        return 'Baru saja'
  if (diff < 3600)      return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400)     return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 2592000)   return `${Math.floor(diff / 86400)} hari lalu`
  return new Date(isoString).toLocaleDateString('id-ID')
}

// ─────────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────────
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-xl fade-in"
      style={{
        background: type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
        border:     `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#4ADE80' }} />
        : <AlertCircle  className="w-4 h-4 flex-shrink-0" style={{ color: '#F87171' }} />
      }
      <p className="text-xs font-medium" style={{ color: type === 'success' ? '#4ADE80' : '#FCA5A5' }}>
        {message}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function ManajemenUser() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [updating, setUpdating] = useState(null)   // id user yang sedang di-update
  const [toast,    setToast]    = useState(null)   // { message, type }

  // ── Fetch all users ──────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('tb_users')
      .select('id, supabase_uid, email, full_name, avatar_url, role, is_active, phone, last_login_at, created_at')
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError('Gagal memuat daftar pengguna. Periksa koneksi dan coba lagi.')
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ── Update role ──────────────────────────────
  const updateRole = async (userId, newRole) => {
    setUpdating(userId + '_role')
    const { error: updateError } = await supabase
      .from('tb_users')
      .update({ role: newRole })
      .eq('id', userId)

    if (updateError) {
      setToast({ message: 'Gagal mengubah role.', type: 'error' })
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setToast({ message: `Role berhasil diubah ke ${ROLE_LABELS[newRole]}.`, type: 'success' })
    }
    setUpdating(null)
  }

  // ── Toggle is_active ─────────────────────────
  const toggleActive = async (userId, currentActive) => {
    setUpdating(userId + '_active')
    const { error: updateError } = await supabase
      .from('tb_users')
      .update({ is_active: !currentActive })
      .eq('id', userId)

    if (updateError) {
      setToast({ message: 'Gagal mengubah status akun.', type: 'error' })
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u))
      setToast({
        message: !currentActive ? 'Akun berhasil diaktifkan.' : 'Akun berhasil dinonaktifkan.',
        type:    !currentActive ? 'success' : 'error',
      })
    }
    setUpdating(null)
  }

  // ── Computed stats ───────────────────────────
  const activeCount  = users.filter(u =>  u.is_active).length
  const pendingCount = users.filter(u => !u.is_active).length

  // ─────────────────────────────────────────────
  return (
    <div>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-8 pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Manajemen User</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold"
              style={{ background: 'rgba(123,45,139,0.1)', border: '1px solid rgba(123,45,139,0.25)', color: '#7B2D8B' }}>
              SSO AKTIF
            </span>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors disabled:opacity-40"
            style={{ borderColor: '#EAE3F5', color: '#7B2D8B', background: '#FAF8FF' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Kelola hak akses staf RiDATOUR. Super Admin dapat mengubah role dan status akun langsung dari halaman ini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Pengguna', value: users.length,  icon: <ShieldCheck className="w-4 h-4" style={{ color: '#7B2D8B' }} /> },
          { label: 'Akun Aktif',     value: activeCount,   icon: <UserCheck   className="w-4 h-4" style={{ color: '#7B2D8B' }} /> },
          { label: 'Menunggu Aktivasi', value: pendingCount, icon: <UserX     className="w-4 h-4" style={{ color: '#F5A623' }} /> },
          { label: 'Provider',       value: 'Google SSO',  icon: <ShieldAlert className="w-4 h-4" style={{ color: '#F5A623' }} /> },
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
          <h4 className="font-bold text-sm mb-1" style={{ color: '#1A1A1A' }}>Kebijakan Keamanan SSO</h4>
          <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
            Semua login staf wajib melalui Google SSO. Akun baru yang mendaftar akan masuk dengan status
            <span className="font-semibold"> Menunggu Aktivasi</span> hingga Super Admin mengaktifkan dan menetapkan role yang sesuai.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center space-x-3 p-4 rounded-xl border mb-6"
          style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#F87171' }} />
          <p className="text-sm" style={{ color: '#FCA5A5' }}>{error}</p>
        </div>
      )}

      {/* User Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: '#F3F4F6', background: '#FAFAFA' }}>
          <span className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Direktori Pengguna Dashboard</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>
            {users.length} pengguna
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: '#7B2D8B' }} />
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Belum ada pengguna terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: '#F9F7FE', borderBottom: '1px solid #EAE3F5' }}>
                  {['Nama & Email', 'No. WhatsApp', 'Role Akses', 'Login Terakhir', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="py-3 px-5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rs         = ROLE_BADGE_STYLE[u.role] || ROLE_BADGE_STYLE.support
                  const isUpdating = updating === u.id + '_role' || updating === u.id + '_active'

                  return (
                    <tr key={u.id} className="table-row-hover border-t" style={{ borderColor: '#F3F4F6', opacity: isUpdating ? 0.6 : 1, transition: 'opacity 0.2s' }}>

                      {/* Nama & Email */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-2.5">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                              style={{ background: 'rgba(123,45,139,0.12)', color: '#7B2D8B' }}>
                              {(u.full_name || u.email)?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-sm block" style={{ color: '#1A1A1A' }}>
                              {u.full_name || '—'}
                            </span>
                            <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* No. WA */}
                      <td className="py-3.5 px-5">
                        {u.phone ? (
                          <a
                            href={`https://wa.me/${u.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs font-mono transition-opacity hover:opacity-70"
                            style={{ color: '#4ADE80' }}
                            title="Buka WhatsApp"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{u.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs" style={{ color: '#D1D5DB' }}>—</span>
                        )}
                      </td>

                      {/* Role dropdown */}
                      <td className="py-3.5 px-5">
                        <div className="relative">
                          <select
                            value={u.role}
                            onChange={e => updateRole(u.id, e.target.value)}
                            disabled={isUpdating}
                            className="appearance-none text-xs font-semibold px-2.5 py-1 pr-6 rounded cursor-pointer focus:outline-none transition-colors"
                            style={{
                              background:   rs.bg,
                              border:       `1px solid ${rs.border}`,
                              color:        rs.color,
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${encodeURIComponent(rs.color)}'/%3E%3C/svg%3E")`,
                              backgroundRepeat:   'no-repeat',
                              backgroundPosition: 'right 6px center',
                            }}
                          >
                            {ALL_ROLES.map(r => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Login terakhir */}
                      <td className="py-3.5 px-5 font-mono text-xs" style={{ color: '#9CA3AF' }}>
                        {relativeTime(u.last_login_at)}
                      </td>

                      {/* Status + toggle */}
                      <td className="py-3.5 px-5">
                        {u.is_active ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#16A34A' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', color: '#D97706' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi: toggle is_active */}
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          disabled={isUpdating}
                          className="relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                          style={{ background: u.is_active ? '#7B2D8B' : '#D1D5DB' }}
                          title={u.is_active ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${u.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
