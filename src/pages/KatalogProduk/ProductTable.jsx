import React from 'react'
import { ArrowUpDown, Edit2, Trash2, Plane, Hotel } from 'lucide-react'
import { formatIDR, CATEGORY_LABELS, categoryStyle } from './constants'

function ColHeader({ field, children, sortField, sortOrder, onSort }) {
  const active = sortField === field
  return (
    <th className="py-3 px-5 cursor-pointer select-none" onClick={() => onSort(field)}
      style={{ whiteSpace: 'nowrap' }}>
      <div className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider"
        style={{ color: active ? '#7B2D8B' : '#9CA3AF' }}>
        <span>{children}</span>
        <ArrowUpDown className="w-3 h-3 flex-shrink-0" style={{ opacity: active ? 1 : 0.5 }} />
      </div>
    </th>
  )
}

export default function ProductTable({ filtered, sortField, sortOrder, onSort, onEdit, onDelete, onToggle }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#EAE3F5' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: '#F9F7FE', borderBottom: '1px solid #EAE3F5' }}>
              <ColHeader field="product_sku" sortField={sortField} sortOrder={sortOrder} onSort={onSort}>SKU</ColHeader>
              <ColHeader field="title"       sortField={sortField} sortOrder={sortOrder} onSort={onSort}>Nama Paket</ColHeader>
              <ColHeader field="category"    sortField={sortField} sortOrder={sortOrder} onSort={onSort}>Kategori</ColHeader>
              <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>Maskapai & Durasi</th>
              <ColHeader field="departure_date" sortField={sortField} sortOrder={sortOrder} onSort={onSort}>Keberangkatan</ColHeader>
              <ColHeader field="normal_price"   sortField={sortField} sortOrder={sortOrder} onSort={onSort}>Harga Normal</ColHeader>
              <ColHeader field="publish_price"  sortField={sortField} sortOrder={sortOrder} onSort={onSort}>Harga Publish</ColHeader>
              <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Status</th>
              <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: '#9CA3AF' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-16 text-center text-sm" style={{ color: '#9CA3AF' }}>
                  Tidak ada paket yang cocok dengan pencarian / filter.
                </td>
              </tr>
            ) : filtered.map(p => {
              const cs         = categoryStyle(p.category)
              const hasDiscount = p.normal_price > p.publish_price
              return (
                <tr key={p.product_sku} className="table-row-hover border-t" style={{ borderColor: '#F3F4F6' }}>

                  {/* SKU — satu-satunya kolom yang wajar pakai monospace karena ini kode produk */}
                  <td className="py-3.5 px-5 font-mono text-xs font-semibold" style={{ color: '#374151' }}>
                    {p.product_sku}
                  </td>

                  {/* Nama + Badge */}
                  <td className="py-3.5 px-5">
                    <span className="font-medium text-sm block" style={{ color: '#1A1A1A' }}>{p.title}</span>
                    {p.badge_label && (
                      <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#D97706' }}>
                        {p.badge_label}
                      </span>
                    )}
                  </td>

                  {/* Kategori */}
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.color }}>
                      {CATEGORY_LABELS[p.category] || p.category}
                    </span>
                  </td>

                  {/* Maskapai & Durasi */}
                  <td className="py-3.5 px-5">
                    {p.airline && (
                      <span className="inline-flex items-center space-x-1.5 text-sm font-medium" style={{ color: '#374151' }}>
                        <Plane className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7B2D8B' }} />
                        <span>{p.airline}</span>
                      </span>
                    )}
                    <span className="text-xs block mt-0.5" style={{ color: '#9CA3AF' }}>{p.duration_days} Hari</span>
                  </td>

                  {/* Keberangkatan */}
                  <td className="py-3.5 px-5 text-sm" style={{ color: p.departure_date ? '#374151' : '#9CA3AF' }}>
                    {p.departure_date
                      ? new Date(p.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>

                  {/* Harga Normal */}
                  <td className="py-3.5 px-5 text-sm" style={{ color: '#9CA3AF' }}>
                    {p.normal_price > 0 ? (
                      <span className={hasDiscount ? 'line-through' : ''}>{formatIDR(p.normal_price)}</span>
                    ) : '—'}
                  </td>

                  {/* Harga Publish */}
                  <td className="py-3.5 px-5 text-sm font-semibold" style={{ color: '#7B2D8B' }}>
                    {formatIDR(p.publish_price)}
                    <span className="text-xs font-normal ml-1" style={{ color: '#9CA3AF' }}>/{p.price_label}</span>
                  </td>

                  {/* Toggle Status */}
                  <td className="py-3.5 px-5">
                    <button onClick={() => onToggle(p.product_sku)}
                      className="relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors cursor-pointer"
                      style={{ background: p.is_active ? '#7B2D8B' : '#D1D5DB' }}
                      title={p.is_active ? 'Nonaktifkan paket' : 'Aktifkan paket'}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${p.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </td>

                  {/* Aksi Edit / Hapus */}
                  <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                    <button onClick={() => onEdit(p)} title="Edit paket"
                      className="p-1.5 rounded-lg transition-colors cursor-pointer inline-flex"
                      style={{ color: '#6B7280' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#1A1A1A' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(p.product_sku)} title="Hapus paket"
                      className="p-1.5 rounded-lg transition-colors cursor-pointer inline-flex"
                      style={{ color: '#EF4444' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
