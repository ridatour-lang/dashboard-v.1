import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import AccessDenied from './components/AccessDenied'
import KatalogProduk from './pages/KatalogProduk'
import BookingInquiry from './pages/BookingInquiry'
import InvoiceB2B from './pages/InvoiceB2B'
import ManajemenUser from './pages/ManajemenUser'
import { useAuth, TAB_PERMISSIONS } from './context/AuthContext'

// Pemetaan tab → komponen halaman
const TAB_PAGES = {
  katalog: { component: KatalogProduk,  label: 'Katalog Produk'       },
  booking: { component: BookingInquiry, label: 'Pemesanan & Inquiry'  },
  b2b:     { component: InvoiceB2B,     label: 'Invoice B2B'          },
  user:    { component: ManajemenUser,  label: 'Manajemen User'       },
}

function Dashboard() {
  const { canAccess, role } = useAuth()

  // Default ke tab pertama yang diizinkan role ini
  const [activeTab, setActiveTab] = useState(() => {
    const tabs = ['katalog', 'booking', 'b2b', 'user']
    return tabs.find(t => (TAB_PERMISSIONS[t] || []).includes(role)) || 'booking'
  })

  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorage.getItem('ridatour_sidebar_collapsed') === 'true'
  )

  useEffect(() => {
    localStorage.setItem('ridatour_sidebar_collapsed', isCollapsed)
  }, [isCollapsed])

  const { component: PageComponent, label } = TAB_PAGES[activeTab] || {}

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F4FC' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full p-8">
          {/* RBAC Guard: cek apakah role boleh akses tab ini */}
          {canAccess(activeTab) && PageComponent ? (
            <PageComponent />
          ) : (
            <AccessDenied tabName={label} />
          )}
        </div>
      </main>
    </div>
  )
}

// Wrap Dashboard dengan ProtectedRoute
export default function App() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
