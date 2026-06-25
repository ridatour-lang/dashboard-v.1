import React from 'react'
import { DollarSign, CheckCircle2, Activity, ExternalLink } from 'lucide-react'
import { StatusBadge, SummaryCard } from '../components/ui/index.jsx'

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const MOCK_TRANSACTIONS = [
  { tx_id: 'TX-XENDIT-9014', customer: 'Budi Santoso',    email: 'budi.santoso@gmail.com',   product: 'eSIM Global MobiMatter',  provider: 'eSIM Saudi', method: 'GoPay',                     amount: 450000, date: '2026-06-18 18:32', status: 'SUCCESS' },
  { tx_id: 'TX-XENDIT-9015', customer: 'Alice Johnson',   email: 'alice.j@corp.com',          product: 'Telkomsel RoaMAX Haji',   provider: 'Telkomsel',  method: 'Mandiri Virtual Account',   amount: 720000, date: '2026-06-18 17:15', status: 'SUCCESS' },
  { tx_id: 'TX-XENDIT-9016', customer: 'David Chen',      email: 'davidchen@outlook.com',     product: 'Indosat Umrah Hemat',     provider: 'Indosat',    method: 'Credit Card',               amount: 245000, date: '2026-06-18 14:02', status: 'PENDING' },
  { tx_id: 'TX-XENDIT-9017', customer: 'Farah Salsabila', email: 'farah.salsa@gmail.com',     product: 'eSIM Global MobiMatter',  provider: 'eSIM Saudi', method: 'ShopeePay',                 amount: 450000, date: '2026-06-17 11:20', status: 'SUCCESS' },
  { tx_id: 'TX-XENDIT-9018', customer: 'Hendra Wijaya',   email: 'hendra.w@yahoo.com',        product: 'Telkomsel RoaMAX Haji',   provider: 'Telkomsel',  method: 'BCA Virtual Account',       amount: 720000, date: '2026-06-16 09:45', status: 'FAILED'  },
]

const successTx   = MOCK_TRANSACTIONS.filter(t => t.status === 'SUCCESS')
const totalVolume = successTx.reduce((a, t) => a + t.amount, 0)
const successRate = ((successTx.length / MOCK_TRANSACTIONS.length) * 100).toFixed(1)

export default function TransaksiB2C() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Transaksi B2C (Xendit Gateway)</h2>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
            INTEGRASI AKTIF
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Laporan real-time transaksi retail eSIM dan Roaming melalui Payment Gateway Xendit.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <SummaryCard
          label="Volume Transaksi Hari Ini"
          value={formatIDR(totalVolume)}
          subtext={`Dari ${successTx.length} transaksi sukses`}
          Icon={DollarSign} iconColor="#7B2D8B" accent
        />
        <SummaryCard
          label="Rasio Kesuksesan (Success Rate)"
          value={`${successRate}%`}
          subtext="1 Pending, 1 Gagal terdeteksi"
          Icon={CheckCircle2} iconColor="#7B2D8B"
        />
        <div className="p-6 rounded-xl border flex items-center justify-between"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
              Status Xendit API
            </p>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full pulse-dot" style={{ background: '#7B2D8B' }} />
              <span className="text-sm font-semibold" style={{ color: '#7B2D8B' }}>Terhubung (200 OK)</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Activity className="w-5 h-5" style={{ color: '#7B2D8B' }} />
            <button className="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FAF8FF' }}>
              Cek Koneksi
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#EAE3F5' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#F3F0F9', background: '#FAFAFE' }}>
          <span className="font-semibold text-sm" style={{ color: '#1E0B35' }}>Transaksi Terbaru</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Menampilkan 5 data terakhir</span>
            <button className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35' }}>
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Xendit Dashboard</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: '#F9F7FE', borderBottom: '1px solid #EAE3F5' }}>
                {['ID Transaksi','Pelanggan','Produk','Metode Bayar','Total Bayar','Waktu','Status'].map(h => (
                  <th key={h} className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map(tx => (
                <tr key={tx.tx_id} className="table-row-hover border-t" style={{ borderColor: '#F3F4F6' }}>
                  <td className="py-3.5 px-5 font-mono text-xs font-semibold" style={{ color: '#374151' }}>{tx.tx_id}</td>
                  <td className="py-3.5 px-5">
                    <span className="font-medium text-sm block" style={{ color: '#1A1A1A' }}>{tx.customer}</span>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{tx.email}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-medium text-sm" style={{ color: '#1A1A1A' }}>{tx.product}</span>
                    <span className="text-xs block" style={{ color: '#9CA3AF' }}>{tx.provider}</span>
                  </td>
                  <td className="py-3.5 px-5 text-sm" style={{ color: '#6B7280' }}>{tx.method}</td>
                  <td className="py-3.5 px-5 font-mono text-sm font-medium" style={{ color: '#1A1A1A' }}>{formatIDR(tx.amount)}</td>
                  <td className="py-3.5 px-5 font-mono text-xs" style={{ color: '#9CA3AF' }}>{tx.date}</td>
                  <td className="py-3.5 px-5"><StatusBadge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
