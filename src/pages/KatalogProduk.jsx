import React, { useState, useEffect, useRef } from 'react'
import {
  Package, Search, Plus, Edit2, Trash2, ArrowUpDown,
  LayoutGrid, Globe, Calendar, AlertCircle, X, Plane
} from 'lucide-react'
import { SummaryCard, StatusBadge } from '../components/ui/index.jsx'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatIDR = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

const CATEGORIES = ['umroh', 'umroh-mandiri', 'muslim-tour', 'fit-products', 'wisata-populer', 'tour-reguler']
const CATEGORY_LABELS = {
  'umroh':          'Umroh',
  'umroh-mandiri':  'Umroh Mandiri',
  'muslim-tour':    'Muslim Tour',
  'fit-products':   'FIT Products',
  'wisata-populer': 'Wisata Populer',
  'tour-reguler':   'Tour Reguler',
}

// ─────────────────────────────────────────────
// Initial Mock Data (sesuai seed schema.sql)
// ─────────────────────────────────────────────
const INITIAL_PRODUCTS = [
  {
    product_sku: 'UMR-REG-PLUS-12D-SEP26',
    category: 'umroh',
    badge_label: 'Terpopuler',
    title: '12D Umroh Reguler Plus',
    subtitle: 'Hotel Pelataran & Kereta Cepat',
    departure_date: '2026-09-10',
    airline: 'Qatar Airways',
    hotel_makkah: 'Al Sofwah Tower 1',
    hotel_madinah: 'Ruve Al Madinah',
    duration_days: 12,
    feature_tags: 'Free Fast Train, Hotel Pelataran',
    normal_price: 49700000,
    publish_price: 46700000,
    price_label: 'Jt/pax',
    cta_text: 'Detail Paket',
    is_active: true,
  },
  {
    product_sku: 'UMR-PREM-HEMAT-9D-OKT26',
    category: 'umroh',
    badge_label: 'Best Deal',
    title: '9D Umroh Premium Hemat',
    subtitle: 'Direct Landing Jeddah',
    departure_date: '2026-10-12',
    airline: 'Saudia Airlines',
    hotel_makkah: 'Grand Al Masa',
    hotel_madinah: 'Kayan International',
    duration_days: 9,
    feature_tags: 'Direct Landing, Premium Hemat',
    normal_price: 35600000,
    publish_price: 31680000,
    price_label: 'Jt/pax',
    cta_text: 'Detail Paket',
    is_active: true,
  },
  {
    product_sku: 'TOUR-TURKIYE-10D-OKT26',
    category: 'muslim-tour',
    badge_label: 'Favorit',
    title: '10D Jelajah Turkiye Halal Tour',
    subtitle: 'Istanbul, Cappadocia & Pamukkale',
    departure_date: '2026-10-15',
    airline: 'Turkish Airlines',
    hotel_makkah: '',
    hotel_madinah: '',
    duration_days: 10,
    feature_tags: 'Bintang 4/5, Cappadocia Cave Hotel',
    normal_price: 26500000,
    publish_price: 24800000,
    price_label: 'Jt/pax',
    cta_text: 'Detail Paket',
    is_active: true,
  },
  {
    product_sku: 'TOUR-SWISS-PARIS-7D-NOV26',
    category: 'wisata-populer',
    badge_label: 'Best Seller',
    title: '7D Scenic Switzerland & Paris',
    subtitle: 'Gunung Titlis & Keindahan Kota Eiffel',
    departure_date: '2026-11-20',
    airline: 'Singapore Airlines',
    hotel_makkah: '',
    hotel_madinah: '',
    duration_days: 7,
    feature_tags: 'Swiss Alps, Eiffel Sunset',
    normal_price: 41500000,
    publish_price: 38900000,
    price_label: 'Jt/pax',
    cta_text: 'Detail Paket',
    is_active: true,
  },
  {
    product_sku: 'TOUR-WEUROPE-9D-DES26',
    category: 'tour-reguler',
    badge_label: 'Group Tour',
    title: '9D Amazing West Europe',
    subtitle: 'Prancis, Belgia, Belanda & Jerman',
    departure_date: '2026-12-12',
    airline: 'Emirates',
    hotel_makkah: '',
    hotel_madinah: '',
    duration_days: 9,
    feature_tags: 'Eropa Barat, Amsterdam Cruise',
    normal_price: 34900000,
    publish_price: 32500000,
    price_label: 'Jt/pax',
    cta_text: 'Detail Paket',
    is_active: true,
  },
]

const EMPTY_FORM = {
  product_sku: '',
  category: 'umroh',
  badge_label: '',
  title: '',
  subtitle: '',
  departure_date: '',
  airline: '',
  hotel_makkah: '',
  hotel_madinah: '',
  duration_days: '',
  feature_tags: '',
  normal_price: '',
  publish_price: '',
  price_label: 'Jt/pax',
  cta_text: 'Detail Paket',
  is_active: true,
}

// ─────────────────────────────────────────────
// Category Badge Colors
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Modal Form
// ─────────────────────────────────────────────
function ProductModal({ dialogRef, isEditMode, formData, formErrors, onChange, onSubmit, onClose }) {
  const normalP  = parseFloat(formData.normal_price)  || 0
  const publishP = parseFloat(formData.publish_price) || 0
  const discount = normalP > publishP ? ((normalP - publishP) / normalP * 100).toFixed(1) : null
  const isUmroh  = formData.category === 'umroh' || formData.category === 'umroh-mandiri'

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="modal-title"
      className="w-full rounded-xl p-0 focus:outline-none"
      style={{
        maxWidth: 560,
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#F3F4F6' }}>
        <h3 id="modal-title" className="font-bold text-base" style={{ color: '#1A1A1A' }}>
          {isEditMode ? 'Edit Paket Perjalanan' : 'Tambah Paket Baru'}
        </h3>
        <button onClick={onClose} className="p-1 rounded-lg transition-colors cursor-pointer"
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
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
            Product SKU <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text" name="product_sku" disabled={isEditMode}
            value={formData.product_sku} onChange={onChange}
            placeholder="Contoh: UMR-REG-12D-JAN27"
            className="w-full px-3 py-2 rounded-lg border text-sm font-mono uppercase focus:outline-none transition-colors"
            style={{
              background: isEditMode ? '#FAF8FF' : '#FFFFFF',
              borderColor: formErrors.product_sku ? '#EF4444' : '#EAE3F5',
              color: '#1A1A1A',
              opacity: isEditMode ? 0.7 : 1,
            }}
          />
          {formErrors.product_sku && (
            <p className="flex items-center space-x-1 mt-1 text-xs" style={{ color: '#EF4444' }}>
              <AlertCircle className="w-3.5 h-3.5" /><span>{formErrors.product_sku}</span>
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
            Kategori Paket <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <select name="category" value={formData.category} onChange={onChange}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FFFFFF' }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>

        {/* Title + Badge */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
              Nama Paket <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input type="text" name="title" value={formData.title} onChange={onChange}
              placeholder="12D Umroh Reguler Plus"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: formErrors.title ? '#EF4444' : '#EAE3F5', color: '#1E0B35' }}
            />
            {formErrors.title && (
              <p className="flex items-center space-x-1 mt-1 text-xs" style={{ color: '#EF4444' }}>
                <AlertCircle className="w-3.5 h-3.5" /><span>{formErrors.title}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Badge Label</label>
            <input type="text" name="badge_label" value={formData.badge_label} onChange={onChange}
              placeholder="Terpopuler"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#E5E7EB', color: '#1A1A1A' }}
            />
          </div>
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Subtitle / Tagline</label>
          <input type="text" name="subtitle" value={formData.subtitle} onChange={onChange}
            placeholder="Hotel Pelataran & Kereta Cepat"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: '#E5E7EB', color: '#1A1A1A' }}
          />
        </div>

        {/* Departure + Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Tanggal Berangkat</label>
            <input type="date" name="departure_date" value={formData.departure_date} onChange={onChange}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none font-mono"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
              Durasi (Hari) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input type="number" name="duration_days" min="1" value={formData.duration_days} onChange={onChange}
              placeholder="12"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none font-mono"
              style={{ borderColor: formErrors.duration_days ? '#EF4444' : '#EAE3F5', color: '#1E0B35' }}
            />
            {formErrors.duration_days && (
              <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{formErrors.duration_days}</p>
            )}
          </div>
        </div>

        {/* Airline */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Maskapai</label>
          <input type="text" name="airline" value={formData.airline} onChange={onChange}
            placeholder="Qatar Airways"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: '#E5E7EB', color: '#1A1A1A' }}
          />
        </div>

        {/* Hotel (hanya tampil untuk umroh) */}
        {isUmroh && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Hotel Makkah</label>
              <input type="text" name="hotel_makkah" value={formData.hotel_makkah} onChange={onChange}
                placeholder="Al Sofwah Tower 1"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#E5E7EB', color: '#1A1A1A' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Hotel Madinah</label>
              <input type="text" name="hotel_madinah" value={formData.hotel_madinah} onChange={onChange}
                placeholder="Ruve Al Madinah"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#E5E7EB', color: '#1A1A1A' }}
              />
            </div>
          </div>
        )}

        {/* Feature Tags */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
            Feature Tags <span className="font-normal normal-case" style={{ color: '#9CA3AF' }}>(pisahkan dengan koma)</span>
          </label>
          <input type="text" name="feature_tags" value={formData.feature_tags} onChange={onChange}
            placeholder="Free Fast Train, Hotel Pelataran"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: '#E5E7EB', color: '#1A1A1A' }}
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
              Harga Normal (Rp)
            </label>
            <input type="number" name="normal_price" min="0" value={formData.normal_price} onChange={onChange}
              placeholder="49700000"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none font-mono"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
              Harga Publish (Rp) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input type="number" name="publish_price" min="0" value={formData.publish_price} onChange={onChange}
              placeholder="46700000"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none font-mono"
              style={{ borderColor: formErrors.publish_price ? '#EF4444' : '#EAE3F5', color: '#1E0B35' }}
            />
            {formErrors.publish_price && (
              <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{formErrors.publish_price}</p>
            )}
          </div>
        </div>

        {/* Price Label + CTA */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Label Harga</label>
            <input type="text" name="price_label" value={formData.price_label} onChange={onChange}
              placeholder="Jt/pax"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Teks Tombol CTA</label>
            <input type="text" name="cta_text" value={formData.cta_text} onChange={onChange}
              placeholder="Detail Paket"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#EAE3F5', color: '#1E0B35' }}
            />
          </div>
        </div>

        {/* Discount preview */}
        {discount && (
          <div className="rounded-xl p-4" style={{ background: '#FAF8FF', border: '1px solid #EAE3F5' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Preview Diskon</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs line-through" style={{ color: '#9CA3AF' }}>{formatIDR(normalP)}</p>
                <p className="text-xl font-bold font-mono" style={{ color: '#7B2D8B' }}>{formatIDR(publishP)}</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-sm font-bold" style={{ background: 'rgba(123,45,139,0.1)', color: '#7B2D8B' }}>
                Hemat {discount}%
              </span>
            </div>
          </div>
        )}

        {/* is_active */}
        <div className="flex items-center space-x-3">
          <input type="checkbox" id="is_active" name="is_active"
            checked={formData.is_active} onChange={onChange}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <label htmlFor="is_active" className="text-sm font-semibold cursor-pointer select-none" style={{ color: '#374151' }}>
            Aktifkan paket di katalog konsumen
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer"
            style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FFFFFF' }}
          >
            Batal
          </button>
          <button type="submit"
            className="px-5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer"
            style={{ background: '#7B2D8B', color: '#FFFFFF' }}
          >
            Simpan Paket
          </button>
        </div>
      </form>
    </dialog>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function KatalogProduk() {
  const dialogRef = useRef(null)
  const [products,       setProducts]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('ridatour_products')) || INITIAL_PRODUCTS } catch { return INITIAL_PRODUCTS }
  })
  const [isEditMode,     setIsEditMode]     = useState(false)
  const [formData,       setFormData]       = useState(EMPTY_FORM)
  const [formErrors,     setFormErrors]     = useState({})
  const [searchTerm,     setSearchTerm]     = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter,   setStatusFilter]   = useState('All')
  const [sortField,      setSortField]      = useState('product_sku')
  const [sortOrder,      setSortOrder]      = useState('asc')

  useEffect(() => {
    localStorage.setItem('ridatour_products', JSON.stringify(products))
  }, [products])

  // Light-dismiss fallback for browsers without closedBy support
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handler = (e) => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const rect = dialog.getBoundingClientRect()
        if (!(rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right))
          dialog.close()
      }
    }
    dialog.addEventListener('click', handler)
    return () => dialog.removeEventListener('click', handler)
  }, [])

  // ── Computed ──────────────────────────────────
  const activeProducts    = products.filter(p => p.is_active)
  const uniqueCategories  = [...new Set(products.map(p => p.category))]
  const topCategory = (() => {
    if (!activeProducts.length) return '-'
    const counts = {}
    activeProducts.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1 })
    return CATEGORY_LABELS[Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]] || '-'
  })()
  const upcomingCount = activeProducts.filter(p => p.departure_date && new Date(p.departure_date) > new Date()).length

  const filtered = products
    .filter(p => {
      const s = searchTerm.toLowerCase()
      return (
        (p.product_sku.toLowerCase().includes(s) || p.title.toLowerCase().includes(s)) &&
        (categoryFilter === 'All' || p.category === categoryFilter) &&
        (statusFilter   === 'All' || (statusFilter === 'Active' ? p.is_active : !p.is_active))
      )
    })
    .sort((a, b) => {
      let vA = a[sortField], vB = b[sortField]
      if (typeof vA === 'string') return sortOrder === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA)
      return sortOrder === 'asc' ? (vA - vB) : (vB - vA)
    })

  // ── Handlers ──────────────────────────────────
  const validate = () => {
    const e = {}
    if (!formData.product_sku.trim())  e.product_sku = 'SKU wajib diisi'
    else if (!isEditMode && products.some(p => p.product_sku.toUpperCase() === formData.product_sku.toUpperCase().trim()))
      e.product_sku = 'SKU sudah terdaftar'
    if (!formData.title.trim())        e.title = 'Nama paket wajib diisi'
    const dur = parseInt(formData.duration_days)
    if (isNaN(dur) || dur <= 0)        e.duration_days = 'Durasi harus > 0 hari'
    const pub = parseFloat(formData.publish_price)
    if (isNaN(pub) || pub <= 0)        e.publish_price = 'Harga publish wajib diisi'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const openAdd = () => { setIsEditMode(false); setFormData(EMPTY_FORM); setFormErrors({}); dialogRef.current?.showModal() }
  const openEdit = (p) => {
    setIsEditMode(true)
    setFormData({
      ...p,
      duration_days: String(p.duration_days),
      normal_price:  String(p.normal_price),
      publish_price: String(p.publish_price),
    })
    setFormErrors({})
    dialogRef.current?.showModal()
  }
  const closeModal = () => dialogRef.current?.close()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const p = {
      product_sku:    formData.product_sku.trim().toUpperCase(),
      category:       formData.category,
      badge_label:    formData.badge_label.trim(),
      title:          formData.title.trim(),
      subtitle:       formData.subtitle.trim(),
      departure_date: formData.departure_date,
      airline:        formData.airline.trim(),
      hotel_makkah:   formData.hotel_makkah.trim(),
      hotel_madinah:  formData.hotel_madinah.trim(),
      duration_days:  parseInt(formData.duration_days),
      feature_tags:   formData.feature_tags.trim(),
      normal_price:   parseFloat(formData.normal_price) || 0,
      publish_price:  parseFloat(formData.publish_price),
      price_label:    formData.price_label || 'Jt/pax',
      cta_text:       formData.cta_text || 'Detail Paket',
      is_active:      formData.is_active,
    }
    setProducts(prev => isEditMode ? prev.map(x => x.product_sku === p.product_sku ? p : x) : [...prev, p])
    closeModal()
  }

  const handleDelete = (sku) => {
    if (window.confirm(`Hapus paket ${sku}?`)) setProducts(prev => prev.filter(p => p.product_sku !== sku))
  }

  const handleSort = (field) => {
    setSortField(field)
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const ColHeader = ({ field, children }) => (
    <th className="py-3 px-5 cursor-pointer select-none" onClick={() => handleSort(field)}
      style={{ whiteSpace: 'nowrap' }}
    >
      <div className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
        <span>{children}</span>
        <ArrowUpDown className="w-3 h-3 flex-shrink-0" />
      </div>
    </th>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b gap-4" style={{ borderColor: '#E5E7EB' }}>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Manajemen Paket Perjalanan</h2>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Kelola katalog paket Umroh, Muslim Tour, FIT, dan Wisata untuk landing page RiDATOUR.
          </p>
        </div>
        <button id="btn-add-product" onClick={openAdd}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer btn-primary"
          style={{ background: '#7B2D8B', color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <SummaryCard label="Total Paket Aktif"       value={activeProducts.length}  subtext={`Dari ${products.length} paket terdaftar`} Icon={LayoutGrid}  iconColor="#7B2D8B" />
        <SummaryCard label="Kategori Terbanyak"      value={topCategory}            subtext="Pada katalog aktif saat ini"               Icon={Globe}       iconColor="#7B2D8B" />
        <SummaryCard label="Keberangkatan Mendatang" value={upcomingCount}           subtext="Paket aktif dengan tanggal berangkat"      Icon={Calendar}    iconColor="#F5A623" accent />
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
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
            {uniqueCategories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: '#EAE3F5', color: '#1E0B35', background: '#FFFFFF' }}
          >
            {[['All','Semua Status'],['Active','Aktif'],['Inactive','Non-aktif']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#EAE3F5' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: '#F9F7FE', borderBottom: '1px solid #EAE3F5' }}>
                <ColHeader field="product_sku">SKU</ColHeader>
                <ColHeader field="title">Nama Paket</ColHeader>
                <ColHeader field="category">Kategori</ColHeader>
                <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>Maskapai & Durasi</th>
                <ColHeader field="departure_date">Keberangkatan</ColHeader>
                <ColHeader field="normal_price">Harga Normal</ColHeader>
                <ColHeader field="publish_price">Harga Publish</ColHeader>
                <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Status</th>
                <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: '#9CA3AF' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="py-16 text-center text-sm" style={{ color: '#9CA3AF' }}>
                  Tidak ada paket yang cocok dengan pencarian / filter.
                </td></tr>
              ) : filtered.map(p => {
                const cs = categoryStyle(p.category)
                const hasDiscount = p.normal_price > p.publish_price
                return (
                  <tr key={p.product_sku} className="table-row-hover border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold" style={{ color: '#374151' }}>{p.product_sku}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-medium text-sm block" style={{ color: '#1A1A1A' }}>{p.title}</span>
                      {p.badge_label && (
                        <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#D97706' }}>
                          {p.badge_label}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.color }}>
                        {CATEGORY_LABELS[p.category] || p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {p.airline && (
                        <span className="inline-flex items-center space-x-1 text-sm font-medium" style={{ color: '#374151' }}>
                          <Plane className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7B2D8B' }} />
                          <span>{p.airline}</span>
                        </span>
                      )}
                      <span className="text-xs block mt-0.5" style={{ color: '#9CA3AF' }}>{p.duration_days} Hari</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs" style={{ color: p.departure_date ? '#374151' : '#9CA3AF' }}>
                      {p.departure_date || '—'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-sm" style={{ color: '#9CA3AF' }}>
                      {p.normal_price > 0 ? (
                        <span className={hasDiscount ? 'line-through' : ''}>{formatIDR(p.normal_price)}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-sm font-semibold" style={{ color: '#7B2D8B' }}>
                      {formatIDR(p.publish_price)}
                      <span className="text-xs font-normal ml-1" style={{ color: '#9CA3AF' }}>/{p.price_label}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <button onClick={() => {
                        setProducts(prev => prev.map(x => x.product_sku === p.product_sku ? { ...x, is_active: !x.is_active } : x))
                      }}
                        className="relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors cursor-pointer"
                        style={{ background: p.is_active ? '#7B2D8B' : '#D1D5DB' }}
                        title="Toggle status"
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${p.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                      <button onClick={() => openEdit(p)} title="Edit"
                        className="p-1.5 rounded-lg transition-colors cursor-pointer inline-flex"
                        style={{ color: '#6B7280' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#1A1A1A' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
                      ><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.product_sku)} title="Hapus"
                        className="p-1.5 rounded-lg transition-colors cursor-pointer inline-flex"
                        style={{ color: '#EF4444' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      ><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        dialogRef={dialogRef} isEditMode={isEditMode}
        formData={formData} formErrors={formErrors}
        onChange={handleChange} onSubmit={handleSubmit} onClose={closeModal}
      />
    </div>
  )
}
