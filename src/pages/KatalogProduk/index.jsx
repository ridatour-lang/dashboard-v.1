import React from 'react'
import { Luggage, Compass, PlaneTakeoff, Plus, Search } from 'lucide-react'
import { SummaryCard } from '../../components/ui/index.jsx'
import { useProductStore } from './useProductStore'
import ProductModal from './ProductModal'
import ProductTable from './ProductTable'
import { CATEGORY_LABELS } from './constants'

export default function KatalogProduk() {
  const {
    dialogRef, filtered, isEditMode, formData, formErrors,
    searchTerm, setSearchTerm, categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter, sortField, sortOrder,
    activeProducts, topCategory, upcomingCount, uniqueCategories, products,
    openAdd, openEdit, closeModal, handleChange, handleSubmit,
    handleDelete, handleSort, toggleActive,
  } = useProductStore()

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b gap-4"
        style={{ borderColor: '#E5E7EB' }}>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Manajemen Paket Perjalanan</h2>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Kelola katalog paket Umroh, Muslim Tour, FIT, dan Wisata untuk landing page RiDATOUR.
          </p>
        </div>
        <button id="btn-add-product" onClick={openAdd}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <SummaryCard
          label="Total Paket Aktif"
          value={activeProducts.length}
          subtext={`Dari ${products.length} paket terdaftar`}
          Icon={Luggage}
          iconColor="#7B2D8B"
        />
        <SummaryCard
          label="Kategori Terbanyak"
          value={topCategory}
          subtext="Pada katalog aktif saat ini"
          Icon={Compass}
          iconColor="#7B2D8B"
        />
        <SummaryCard
          label="Keberangkatan Mendatang"
          value={upcomingCount}
          subtext="Paket aktif dengan tanggal berangkat"
          Icon={PlaneTakeoff}
          iconColor="#F5A623"
          accent
        />
      </div>

      {/* Filter */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari SKU atau nama paket..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35' }}
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FFFFFF' }}
          >
            <option value="All">Semua Kategori</option>
            {uniqueCategories.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FFFFFF' }}
          >
            {[['All', 'Semua Status'], ['Active', 'Aktif'], ['Inactive', 'Non-aktif']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Produk */}
      <ProductTable
        filtered={filtered}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggle={toggleActive}
      />

      {/* Modal Tambah / Edit */}
      <ProductModal
        dialogRef={dialogRef}
        isEditMode={isEditMode}
        formData={formData}
        formErrors={formErrors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </div>
  )
}
