import React from 'react'
import {
  Package, ClipboardList, FileText, Users,
  ChevronLeft, ChevronRight, LogOut, ShieldCheck,
} from 'lucide-react'
import { useAuth, TAB_PERMISSIONS, ROLE_LABELS } from '../context/AuthContext'

const NAV_ITEMS = [
  { id: 'katalog',  label: 'Katalog Produk',        Icon: Package       },
  { id: 'booking',  label: 'Pemesanan & Inquiry',   Icon: ClipboardList },
  { id: 'b2b',      label: 'Invoice B2B (Paper.id)',Icon: FileText      },
  { id: 'user',     label: 'Manajemen User (SSO)',  Icon: Users         },
]

// RiDATOUR logo mark untuk sidebar
function SidebarLogo({ collapsed }) {
  return (
    <div className={`flex items-center mb-8 ${collapsed ? 'justify-center' : 'space-x-3'}`}>
      {/* Circle logo */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full font-extrabold text-white"
        style={{
          width: 38, height: 38,
          background: 'linear-gradient(135deg, #7B2D8B 0%, #9B3AAE 100%)',
          boxShadow: '0 0 14px rgba(123,45,139,0.5)',
          fontSize: 13,
          letterSpacing: 1,
        }}
      >
        {/* Miniature plane in gold */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M21 3L3 10.5l6.75 2.25L12 21l2.25-5.25L21 3z" fill="#F5A623" opacity="0.95"/>
        </svg>
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <p className="font-extrabold text-sm leading-tight text-white tracking-wide">RiDATOUR</p>
          <p className="text-[10px] uppercase tracking-widest mt-0.5"
            style={{ color: '#6B5880', fontFamily: 'monospace' }}>
            Admin Portal
          </p>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const { role, displayName, avatarUrl, signOut, user } = useAuth()

  const visibleItems = NAV_ITEMS.filter(item =>
    (TAB_PERMISSIONS[item.id] || []).includes(role)
  )

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <aside
      className="flex flex-col justify-between flex-shrink-0 relative transition-all duration-300 ease-in-out"
      style={{
        width: isCollapsed ? 72 : 256,
        background: '#1A0B2E',
        borderRight: '1px solid #2D1550',
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        className="absolute -right-3 top-6 z-50 flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer focus:outline-none transition-all duration-200"
        style={{ background: '#2D1550', borderColor: '#3D1F6A', color: '#9B7CC0' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#7B2D8B'; e.currentTarget.style.color = '#FFFFFF' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#2D1550'; e.currentTarget.style.color = '#9B7CC0' }}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5"/> : <ChevronLeft className="w-3.5 h-3.5"/>}
      </button>

      {/* Top section */}
      <div className={`${isCollapsed ? 'px-3 pt-5' : 'px-5 pt-6'} transition-all duration-300`}>
        <SidebarLogo collapsed={isCollapsed}/>

        {/* Nav items */}
        <nav className="space-y-0.5">
          {visibleItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => setActiveTab(id)}
                title={isCollapsed ? label : undefined}
                className={`
                  w-full flex items-center py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 cursor-pointer focus:outline-none
                  ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-3'}
                `}
                style={{
                  background:  isActive ? '#F5A623'  : 'transparent',
                  color:       isActive ? '#1A0B2E'  : '#9B8DB0',
                  fontWeight:  isActive ? 700        : 500,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#261040'; e.currentTarget.style.color = '#D4BBEE' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9B8DB0' } }}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0"/>
                {!isCollapsed && <span className="truncate leading-none">{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Role badge */}
        {!isCollapsed && role && (
          <div
            className="mt-6 flex items-center space-x-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(123,45,139,0.15)', border: '1px solid rgba(123,45,139,0.3)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#F5A623' }}/>
            <span className="text-[11px] font-semibold truncate" style={{ color: '#D4A8E8' }}>
              {ROLE_LABELS[role] || role}
            </span>
          </div>
        )}
      </div>

      {/* Bottom: user info + logout */}
      <div
        className={`p-3 border-t ${isCollapsed ? 'flex flex-col items-center space-y-2' : 'flex items-center justify-between space-x-2'}`}
        style={{ borderColor: '#2D1550' }}
      >
        <div className={`flex items-center overflow-hidden ${isCollapsed ? '' : 'space-x-2.5 flex-1 min-w-0'}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName}
              title={isCollapsed ? `${displayName}\n${user?.email}` : undefined}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              style={{ outline: '2px solid #3D1F6A' }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#7B2D8B', color: '#FFFFFF' }}
              title={isCollapsed ? `${displayName}\n${user?.email}` : undefined}
            >
              {initials}
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">{displayName}</p>
              <p className="text-[10px] truncate" style={{ color: '#6B5880', fontFamily: 'monospace' }}>
                {user?.email}
              </p>
            </div>
          )}
        </div>
        <button
          id="btn-logout"
          onClick={signOut}
          title="Keluar dari Portal"
          className="p-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer focus:outline-none"
          style={{ color: '#6B5880' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6B5880'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut className="w-4 h-4"/>
        </button>
      </div>
    </aside>
  )
}
