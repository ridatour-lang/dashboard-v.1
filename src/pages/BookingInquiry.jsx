import React, { useState } from 'react'
import { Calendar, CheckCircle2, Clock, MessageSquare, UserCheck } from 'lucide-react'
import { StatusBadge, SummaryCard } from '../components/ui/index.jsx'

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

// ─────────────────────────────────────────────
// Mock Data — ganti dengan query Supabase setelah dikonfigurasi
// ─────────────────────────────────────────────
const MOCK_BOOKINGS = [
  {
    booking_id: 'BK-2026-0041',
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    phone: '+62 812-3456-7890',
    product: '12D Umroh Reguler Plus',
    category: 'umroh',
    departure_date: '2026-09-10',
    pax: 2,
    total_price: 93400000,
    inquiry_date: '2026-06-24 10:15',
    status: 'NEW',
    notes: 'Tanya via WhatsApp, butuh info pelunasan',
  },
  {
    booking_id: 'BK-2026-0042',
    name: 'Sari Dewi',
    email: 'sari.dewi@yahoo.com',
    phone: '+62 857-9876-5432',
    product: '10D Jelajah Turkiye Halal Tour',
    category: 'muslim-tour',
    departure_date: '2026-10-15',
    pax: 4,
    total_price: 99200000,
    inquiry_date: '2026-06-23 14:30',
    status: 'CONTACTED',
    notes: 'Sudah dihubungi, menunggu konfirmasi keluarga',
  },
  {
    booking_id: 'BK-2026-0043',
    name: 'Hendra Wijaya',
    email: 'hendra.w@corp.com',
    phone: '+62 821-1122-3344',
    product: '9D Umroh Premium Hemat',
    category: 'umroh',
    departure_date: '2026-10-12',
    pax: 1,
    total_price: 31680000,
    inquiry_date: '2026-06-22 09:00',
    status: 'BOOKED',
    notes: 'DP sudah masuk, invoice diterbitkan',
  },
  {
    booking_id: 'BK-2026-0044',
    name: 'Farah Salsabila',
    email: 'farah.salsa@gmail.com',
    phone: '+62 838-5566-7788',
    product: '7D Scenic Switzerland & Paris',
    category: 'wisata-populer',
    departure_date: '2026-11-20',
    pax: 2,
    total_price: 77800000,
    inquiry_date: '2026-06-21 16:45',
    status: 'CANCELLED',
    notes: 'Batal, alasan pribadi',
  },
  {
    booking_id: 'BK-2026-0045',
    name: 'Rizky Pratama',
    email: 'rizky.p@outlook.com',
    phone: '+62 812-9988-7766',
    product: '9D Amazing West Europe',
    category: 'tour-reguler',
    departure_date: '2026-12-12',
    pax: 3,
    total_price: 97500000,
    inquiry_date: '2026-06-25 08:20',
    status: 'NEW',
    notes: '',
  },
]

const CATEGORY_LABELS = {
  'umroh':          'Umroh',
  'umroh-mandiri':  'Umroh Mandiri',
  'muslim-tour':    'Muslim Tour',
  'fit-products':   'FIT Products',
  'wisata-populer': 'Wisata Populer',
  'tour-reguler':   'Tour Reguler',
}

function categoryStyle(cat) {
  const map = {
    'umroh':          { bg: 'rgba(123,45,139,0.08)', border: 'rgba(123,45,139,0.2)',  color: '#7B2D8B' },
    'umroh-mandiri':  { bg: 'rgba(123,45,139,0.06)', border: 'rgba(123,45,139,0.15)', color: '#9B3AAE' },
    'muslim-tour':    { bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)',  color: '#B8760A' },
    'fit-products':   { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)',  color: '#2563EB' },
    'wisata-populer': { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  color: '#059669' },
    'tour-reguler':   { bg: 'rgba(107,114,128,0.08)',border: 'rgba(107,114,128,0.2)', color: '#6B7280' },
  }
  return map[cat] || map['tour-reguler']
}

export default function BookingInquiry() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm,   setSearchTerm]   = useState('')

  const newCount      = MOCK_BOOKINGS.filter(b => b.status === 'NEW').length
  const bookedCount   = MOCK_BOOKINGS.filter(b => b.status === 'BOOKED').length
  const totalBookedRp = MOCK_BOOKINGS
    .filter(b => b.status === 'BOOKED')
    .reduce((a, b) => a + b.total_price, 0)

  const filtered = MOCK_BOOKINGS.filter(b => {
    const s = searchTerm.toLowerCase()
    const matchSearch = (
      b.name.toLowerCase().includes(s) ||
      b.product.toLowerCase().includes(s) ||
      b.booking_id.toLowerCase().includes(s)
    )
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8 pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Pemesanan & Inquiry</h2>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold"
            style={{ background: 'rgba(123,45,139,0.1)', border: '1px solid rgba(123,45,139,0.25)', color: '#7B2D8B' }}>
            LANDING PAGE FEED
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Daftar inquiry dan pemesanan paket perjalanan yang masuk dari konsumen landing page RiDATOUR.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <SummaryCard
          label="Inquiry Baru (Belum Diproses)"
          value={newCount}
          subtext="Perlu follow-up segera"
          Icon={MessageSquare} iconColor="#7B2D8B" accent
        />
        <SummaryCard
          label="Paket Berhasil Dibooking"
          value={bookedCount}
          subtext={`Nilai: ${formatIDR(totalBookedRp)}`}
          Icon={CheckCircle2} iconColor="#059669" accent
        />
        <SummaryCard
          label="Total Inquiry Masuk"
          value={MOCK_BOOKINGS.length}
          subtext="Semua status"
          Icon={UserCheck} iconColor="#F5A623"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4 mb-6" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9CA3AF' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari nama, produk, atau ID booking..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35' }}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FFFFFF' }}
          >
            {['All', 'NEW', 'CONTACTED', 'BOOKED', 'CANCELLED'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'Semua Status' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#EAE3F5' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: '#F3F4F6', background: '#FAFAFE' }}>
          <span className="font-semibold text-sm" style={{ color: '#1E0B35' }}>Daftar Inquiry Masuk</span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            Menampilkan {filtered.length} dari {MOCK_BOOKINGS.length} inquiry
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: '#F9F7FE', borderBottom: '1px solid #EAE3F5' }}>
                {['ID Booking','Pemesan','Paket Diminati','Kategori','Tgl Berangkat','Pax & Estimasi Harga','Tgl Inquiry','Status','Catatan'].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-sm" style={{ color: '#9CA3AF' }}>
                    Tidak ada inquiry yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : filtered.map(b => {
                const cs = categoryStyle(b.category)
                return (
                  <tr key={b.booking_id} className="table-row-hover border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold" style={{ color: '#374151' }}>
                      {b.booking_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-sm block" style={{ color: '#1A1A1A' }}>{b.name}</span>
                      <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{b.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-sm" style={{ color: '#1A1A1A' }}>{b.product}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.color }}>
                        {CATEGORY_LABELS[b.category] || b.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs" style={{ color: '#374151' }}>
                      {b.departure_date ? (
                        <span className="inline-flex items-center space-x-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: '#7B2D8B' }} />
                          <span>{b.departure_date}</span>
                        </span>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>Fleksibel</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{b.pax} pax</span>
                      <span className="text-xs font-mono block" style={{ color: '#9CA3AF' }}>
                        {formatIDR(b.total_price)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs" style={{ color: '#9CA3AF' }}>
                      <span className="inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{b.inquiry_date}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs max-w-[160px] truncate" style={{ color: '#6B7280' }}>
                      {b.notes || <span style={{ color: '#D1D5DB' }}>—</span>}
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
