import React from 'react'

// ─────────────────────────────────────────────
// RiDATOUR Brand Status Styles
// ─────────────────────────────────────────────
const STATUS_STYLES = {
  SUCCESS:   { bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.25)',  color: '#059669' },
  PAID:      { bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.25)',  color: '#059669' },
  PENDING:   { bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.25)',  color: '#D97706' },
  UNPAID:    { bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.25)',  color: '#D97706' },
  FAILED:    { bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.25)',   color: '#DC2626' },
  OVERDUE:   { bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.25)',   color: '#DC2626' },
  Active:    { bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.25)',  color: '#059669' },
  Suspended: { bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.25)',   color: '#DC2626' },
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: '#F3F0F9', border: '#E0D1F0', color: '#9B8DB0' }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {status}
    </span>
  )
}

// ─────────────────────────────────────────────
// Summary Card — RiDATOUR brand
// ─────────────────────────────────────────────
export function SummaryCard({ label, value, subtext, Icon, iconColor = '#7B2D8B', accent = false }) {
  return (
    <div className="p-6 rounded-xl border flex items-center justify-between"
      style={{ background: '#FFFFFF', borderColor: '#EAE3F5' }}>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9B8DB0' }}>
          {label}
        </p>
        <p className="text-2xl font-bold truncate"
          style={{ color: accent ? iconColor : '#1E0B35' }}>
          {value}
        </p>
        {subtext && (
          <p className="text-xs mt-1 truncate" style={{ color: '#C4B0D8' }}>{subtext}</p>
        )}
      </div>
      <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ml-4"
        style={{ background: `${iconColor}14`, border: `1px solid ${iconColor}26` }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }}/>
      </div>
    </div>
  )
}
