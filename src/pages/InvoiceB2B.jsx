import React from 'react'
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Mail, Download } from 'lucide-react'
import { StatusBadge, SummaryCard } from '../components/ui/index.jsx'

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const MOCK_INVOICES = [
  { inv_id: 'INV-PAPER-2026042', client: 'PT Travelindo Utama',  pic: 'Rian Hidayat',   issued_date: '2026-06-10', due_date: '2026-07-10', amount: 12500000, status: 'UNPAID',  days_left: 22  },
  { inv_id: 'INV-PAPER-2026043', client: 'Global Roaming Corp',  pic: 'Jonathan Doe',   issued_date: '2026-06-12', due_date: '2026-07-12', amount: 8400000,  status: 'PAID',    days_left: null },
  { inv_id: 'INV-PAPER-2026044', client: 'Indo Tour & Travel',   pic: 'Lanny Wijaya',   issued_date: '2026-06-15', due_date: '2026-06-30', amount: 24500000, status: 'OVERDUE', days_left: -18 },
]

const outstanding = MOCK_INVOICES.filter(i => i.status !== 'PAID').reduce((a, i) => a + i.amount, 0)
const paid        = MOCK_INVOICES.filter(i => i.status === 'PAID').reduce((a, i) => a + i.amount, 0)
const overdueCount = MOCK_INVOICES.filter(i => i.status === 'OVERDUE').length

export default function InvoiceB2B() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Invoice B2B (Paper.id Integration)</h2>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
            INTEGRASI AKTIF
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Manajemen penagihan piutang dan invoice berjangka (Term of Payment) dengan agen B2B KianGroup via Paper.id.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <SummaryCard
          label="Total Piutang Belum Terbayar"
          value={formatIDR(outstanding)}
          subtext={`${MOCK_INVOICES.filter(i=>i.status!=='PAID').length} invoice (Outstanding & Overdue)`}
          Icon={AlertTriangle} iconColor="#F5A623" accent
        />
        <SummaryCard
          label="Total Terbayar (Bulan Ini)"
          value={formatIDR(paid)}
          subtext="Telah disinkronkan ke pembukuan"
          Icon={CheckCircle2} iconColor="#7B2D8B" accent
        />
        <div className="p-6 rounded-xl border flex items-center justify-between"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Rasio Keterlambatan</p>
            <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>
              {((overdueCount / MOCK_INVOICES.length) * 100).toFixed(1)}%
            </p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{overdueCount} Invoice Overdue penagihan</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Clock className="w-5 h-5" style={{ color: '#DC2626' }} />
            <button className="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FAF8FF' }}>
              Sinkronisasi Ulang
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#F3F4F6', background: '#FAFAFA' }}>
          <span className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Invoice B2B</span>
          <button className="inline-flex items-center space-x-1.5 text-xs font-semibold cursor-pointer transition-colors"
            style={{ color: '#F5A623' }}>
            <span>Lihat Seluruh di Paper.id Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: '#F9F7FE', borderBottom: '1px solid #EAE3F5' }}>
                {['ID Invoice','Nama Klien / Partner B2B','PIC Mitra','Tanggal Rilis','Jatuh Tempo','Jumlah Tagihan','Status','Aksi'].map(h => (
                  <th key={h} className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map(inv => (
                <tr key={inv.inv_id} className="table-row-hover border-t" style={{ borderColor: '#F3F4F6' }}>
                  <td className="py-3.5 px-5 font-mono text-xs font-semibold" style={{ color: '#374151' }}>{inv.inv_id}</td>
                  <td className="py-3.5 px-5 font-medium text-sm" style={{ color: '#1A1A1A' }}>{inv.client}</td>
                  <td className="py-3.5 px-5 text-sm" style={{ color: '#6B7280' }}>{inv.pic}</td>
                  <td className="py-3.5 px-5 font-mono text-xs" style={{ color: '#9CA3AF' }}>{inv.issued_date}</td>
                  <td className="py-3.5 px-5 font-mono text-xs">
                    <span className="block" style={{ color: '#374151' }}>{inv.due_date}</span>
                    {inv.status === 'UNPAID' && (
                      <span className="text-[10px]" style={{ color: '#D97706' }}>({inv.days_left} hari tersisa)</span>
                    )}
                    {inv.status === 'OVERDUE' && (
                      <span className="text-[10px] font-semibold" style={{ color: '#DC2626' }}>({Math.abs(inv.days_left)} hari terlambat)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-sm font-semibold" style={{ color: '#1A1A1A' }}>{formatIDR(inv.amount)}</td>
                  <td className="py-3.5 px-5"><StatusBadge status={inv.status} /></td>
                  <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => alert(`Mengirim reminder penagihan untuk ${inv.inv_id}...`)}
                      disabled={inv.status === 'PAID'}
                      title={inv.status === 'PAID' ? 'Invoice sudah lunas' : 'Kirim Reminder'}
                      className="inline-flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FAF8FF' }}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Remind</span>
                    </button>
                    <button
                      onClick={() => alert(`Mengunduh PDF ${inv.inv_id}...`)}
                      title="Unduh PDF"
                      className="inline-flex items-center p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer"
                      style={{ borderColor: '#E5E7EB', color: '#374151', background: '#F9FAFB' }}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
