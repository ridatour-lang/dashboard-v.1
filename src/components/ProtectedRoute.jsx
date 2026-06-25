import React from 'react'
import { useAuth } from '../context/AuthContext'
import LoginPage from './LoginPage'

export default function ProtectedRoute({ children }) {
  const { session, loading, pendingUser, pendingApproval } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F0718' }}>
        <div className="flex flex-col items-center space-y-5">
          {/* RiDATOUR logo mark */}
          <img
            src="/logo.png"
            alt="RiDATOUR Logo"
            className="w-14 h-14 rounded-full object-cover"
            style={{ boxShadow: '0 0 24px rgba(123,45,139,0.4)' }}
          />
          {/* Bouncing dots */}
          <div className="flex items-center space-x-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full"
                style={{ background: '#7B2D8B', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: '#6B5880', fontFamily: 'monospace' }}>
            Memverifikasi sesi...
          </p>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  if (!session || pendingUser || pendingApproval) {
    return <LoginPage />
  }
  return children
}
