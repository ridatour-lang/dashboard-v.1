import { useState, useEffect, useRef } from 'react'
import { INITIAL_PRODUCTS, EMPTY_FORM, CATEGORY_LABELS } from './constants'

export function useProductStore() {
  const dialogRef = useRef(null)

  const [products, setProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ridatour_products')) || INITIAL_PRODUCTS }
    catch { return INITIAL_PRODUCTS }
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

  // Light-dismiss fallback untuk browser tanpa dukungan closedBy
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

  // ── Computed ─────────────────────────────────────────────
  const activeProducts   = products.filter(p => p.is_active)
  const uniqueCategories = [...new Set(products.map(p => p.category))]

  const topCategory = (() => {
    if (!activeProducts.length) return '-'
    const counts = {}
    activeProducts.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1 })
    return CATEGORY_LABELS[Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]] || '-'
  })()

  const upcomingCount = activeProducts.filter(
    p => p.departure_date && new Date(p.departure_date) > new Date()
  ).length

  const filtered = products
    .filter(p => {
      const s = searchTerm.toLowerCase()
      return (
        (p.product_sku.toLowerCase().includes(s) || p.title.toLowerCase().includes(s)) &&
        (categoryFilter === 'All' || p.category === categoryFilter) &&
        (statusFilter === 'All' || (statusFilter === 'Active' ? p.is_active : !p.is_active))
      )
    })
    .sort((a, b) => {
      const vA = a[sortField], vB = b[sortField]
      if (typeof vA === 'string') return sortOrder === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA)
      return sortOrder === 'asc' ? (vA - vB) : (vB - vA)
    })

  // ── Handlers ─────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!formData.product_sku.trim()) e.product_sku = 'SKU wajib diisi'
    else if (!isEditMode && products.some(p => p.product_sku.toUpperCase() === formData.product_sku.toUpperCase().trim()))
      e.product_sku = 'SKU sudah terdaftar'
    if (!formData.title.trim()) e.title = 'Nama paket wajib diisi'
    const dur = parseInt(formData.duration_days)
    if (isNaN(dur) || dur <= 0) e.duration_days = 'Durasi harus > 0 hari'
    const pub = parseFloat(formData.publish_price)
    if (isNaN(pub) || pub <= 0) e.publish_price = 'Harga publish wajib diisi'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const openAdd = () => {
    setIsEditMode(false)
    setFormData(EMPTY_FORM)
    setFormErrors({})
    dialogRef.current?.showModal()
  }

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
    setProducts(prev =>
      isEditMode ? prev.map(x => x.product_sku === p.product_sku ? p : x) : [...prev, p]
    )
    closeModal()
  }

  const handleDelete = (sku) => {
    if (window.confirm(`Hapus paket ${sku}?`))
      setProducts(prev => prev.filter(p => p.product_sku !== sku))
  }

  const handleSort = (field) => {
    setSortField(field)
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const toggleActive = (sku) => {
    setProducts(prev => prev.map(x => x.product_sku === sku ? { ...x, is_active: !x.is_active } : x))
  }

  return {
    dialogRef, products, filtered, isEditMode, formData, formErrors,
    searchTerm, setSearchTerm, categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter, sortField, sortOrder,
    activeProducts, topCategory, upcomingCount, uniqueCategories,
    openAdd, openEdit, closeModal, handleChange, handleSubmit,
    handleDelete, handleSort, toggleActive,
  }
}
