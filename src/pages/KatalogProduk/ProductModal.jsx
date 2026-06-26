import React from 'react'
import { X, AlertCircle, Plane, Hotel, Calendar, Clock, Tag, Ticket } from 'lucide-react'
import { formatIDR, CATEGORIES, CATEGORY_LABELS } from './constants'

function FieldLabel({ children, required, icon: Icon }) {
  return (
    <label className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: '#6B7280' }}>
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{children}</span>
      {required && <span style={{ color: '#EF4444' }}>*</span>}
    </label>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="flex items-center space-x-1 mt-1 text-xs" style={{ color: '#EF4444' }}>
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{message}</span>
    </p>
  )
}

const inputBase = {
  borderColor: '#EAE3F5',
  color: '#1E0B35',
  background: '#FFFFFF',
}

export default function ProductModal({ dialogRef, isEditMode, formData, formErrors, onChange, onSubmit, onClose }) {
  const normalP  = parseFloat(formData.normal_price)  || 0
  const publishP = parseFloat(formData.publish_price) || 0
  const discount = normalP > publishP ? ((normalP - publishP) / normalP * 100).toFixed(1) : null
  const isUmroh  = formData.category === 'umroh' || formData.category === 'umroh-mandiri'

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="modal-title"
      className="w-full rounded-2xl p-0 focus:outline-none"
      style={{
        maxWidth: 560,
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#F3F4F6' }}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(123,45,139,0.08)', border: '1px solid rgba(123,45,139,0.15)' }}>
            <Ticket className="w-4 h-4" style={{ color: '#7B2D8B' }} />
          </div>
          <h3 id="modal-title" className="font-bold text-base" style={{ color: '#1A1A1A' }}>
            {isEditMode ? 'Edit Paket Perjalanan' : 'Tambah Paket Baru'}
          </h3>
        </div>
        <button onClick={onClose}
          className="p-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ color: '#9CA3AF' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#374151' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '75vh' }}>

        {/* SKU */}
        <div>
          <FieldLabel required icon={Ticket}>Product SKU</FieldLabel>
          <input
            type="text" name="product_sku" disabled={isEditMode}
            value={formData.product_sku} onChange={onChange}
            placeholder="Contoh: UMR-REG-12D-JAN27"
            className="w-full px-3 py-2 rounded-lg border text-sm font-mono uppercase focus:outline-none transition-colors"
            style={{
              ...inputBase,
              borderColor: formErrors.product_sku ? '#EF4444' : '#EAE3F5',
              background: isEditMode ? '#FAF8FF' : '#FFFFFF',
              opacity: isEditMode ? 0.7 : 1,
            }}
          />
          <FieldError message={formErrors.product_sku} />
        </div>

        {/* Kategori */}
        <div>
          <FieldLabel required icon={Tag}>Kategori Paket</FieldLabel>
          <select name="category" value={formData.category} onChange={onChange}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={inputBase}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>

        {/* Nama Paket + Badge */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Nama Paket</FieldLabel>
            <input type="text" name="title" value={formData.title} onChange={onChange}
              placeholder="12D Umroh Reguler Plus"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ ...inputBase, borderColor: formErrors.title ? '#EF4444' : '#EAE3F5' }}
            />
            <FieldError message={formErrors.title} />
          </div>
          <div>
            <FieldLabel>Badge Label</FieldLabel>
            <input type="text" name="badge_label" value={formData.badge_label} onChange={onChange}
              placeholder="Terpopuler"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={inputBase}
            />
          </div>
        </div>

        {/* Subtitle */}
        <div>
          <FieldLabel>Subtitle / Tagline</FieldLabel>
          <input type="text" name="subtitle" value={formData.subtitle} onChange={onChange}
            placeholder="Hotel Pelataran & Kereta Cepat"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={inputBase}
          />
        </div>

        {/* Tanggal + Durasi */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel icon={Calendar}>Tanggal Berangkat</FieldLabel>
            <input type="date" name="departure_date" value={formData.departure_date} onChange={onChange}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={inputBase}
            />
          </div>
          <div>
            <FieldLabel required icon={Clock}>Durasi (Hari)</FieldLabel>
            <input type="number" name="duration_days" min="1" value={formData.duration_days} onChange={onChange}
              placeholder="12"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ ...inputBase, borderColor: formErrors.duration_days ? '#EF4444' : '#EAE3F5' }}
            />
            <FieldError message={formErrors.duration_days} />
          </div>
        </div>

        {/* Maskapai */}
        <div>
          <FieldLabel icon={Plane}>Maskapai</FieldLabel>
          <input type="text" name="airline" value={formData.airline} onChange={onChange}
            placeholder="Qatar Airways"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={inputBase}
          />
        </div>

        {/* Hotel — hanya untuk kategori umroh */}
        {isUmroh && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel icon={Hotel}>Hotel Makkah</FieldLabel>
              <input type="text" name="hotel_makkah" value={formData.hotel_makkah} onChange={onChange}
                placeholder="Al Sofwah Tower 1"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputBase}
              />
            </div>
            <div>
              <FieldLabel icon={Hotel}>Hotel Madinah</FieldLabel>
              <input type="text" name="hotel_madinah" value={formData.hotel_madinah} onChange={onChange}
                placeholder="Ruve Al Madinah"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputBase}
              />
            </div>
          </div>
        )}

        {/* Feature Tags */}
        <div>
          <FieldLabel>
            Feature Tags{' '}
            <span className="font-normal normal-case ml-1" style={{ color: '#9CA3AF' }}>(pisahkan dengan koma)</span>
          </FieldLabel>
          <input type="text" name="feature_tags" value={formData.feature_tags} onChange={onChange}
            placeholder="Free Fast Train, Hotel Pelataran"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={inputBase}
          />
        </div>

        {/* Harga */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Harga Normal (Rp)</FieldLabel>
            <input type="number" name="normal_price" min="0" value={formData.normal_price} onChange={onChange}
              placeholder="49700000"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={inputBase}
            />
          </div>
          <div>
            <FieldLabel required>Harga Publish (Rp)</FieldLabel>
            <input type="number" name="publish_price" min="0" value={formData.publish_price} onChange={onChange}
              placeholder="46700000"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ ...inputBase, borderColor: formErrors.publish_price ? '#EF4444' : '#EAE3F5' }}
            />
            <FieldError message={formErrors.publish_price} />
          </div>
        </div>

        {/* Label Harga + CTA */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Label Harga</FieldLabel>
            <input type="text" name="price_label" value={formData.price_label} onChange={onChange}
              placeholder="Jt/pax"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={inputBase}
            />
          </div>
          <div>
            <FieldLabel>Teks Tombol</FieldLabel>
            <input type="text" name="cta_text" value={formData.cta_text} onChange={onChange}
              placeholder="Detail Paket"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={inputBase}
            />
          </div>
        </div>

        {/* Preview diskon */}
        {discount && (
          <div className="rounded-xl p-4" style={{ background: '#FAF8FF', border: '1px solid #EAE3F5' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
              Preview Diskon
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs line-through" style={{ color: '#9CA3AF' }}>{formatIDR(normalP)}</p>
                <p className="text-xl font-bold" style={{ color: '#7B2D8B' }}>{formatIDR(publishP)}</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(123,45,139,0.1)', color: '#7B2D8B' }}>
                Hemat {discount}%
              </span>
            </div>
          </div>
        )}

        {/* Status aktif */}
        <div className="flex items-center space-x-3">
          <input type="checkbox" id="is_active" name="is_active"
            checked={formData.is_active} onChange={onChange}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <label htmlFor="is_active" className="text-sm font-semibold cursor-pointer select-none"
            style={{ color: '#374151' }}>
            Aktifkan paket di katalog konsumen
          </label>
        </div>

        {/* Aksi */}
        <div className="flex justify-end space-x-3 pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer"
            style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FFFFFF' }}
          >
            Batal
          </button>
          <button type="submit"
            className="px-5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer btn-primary"
          >
            Simpan Paket
          </button>
        </div>
      </form>
    </dialog>
  )
}
