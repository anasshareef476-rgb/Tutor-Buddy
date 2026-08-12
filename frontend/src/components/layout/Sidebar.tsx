'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/chat', icon: '💬', label: 'AI Chat' },
  { href: '/flashcards', icon: '🃏', label: 'Flashcards' },
  { href: '/documents', icon: '📄', label: 'Documents' },
  { href: '/quiz', icon: '📝', label: 'Quiz' },
  { href: '/notes', icon: '📒', label: 'Notes' },
  { href: '/roadmap', icon: '🗺️', label: 'Roadmap' },
  { href: '/progress', icon: '📊', label: 'Progress' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '4px 8px' }}
      >
        <span style={{ fontSize: 26 }}>🎓</span>
        <span style={{ fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tutor Buddy</span>
      </motion.div>

      {/* Nav */}
      {navItems.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <motion.div key={item.href} whileHover={{ scale: 1.03, x: 4 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
            <Link href={item.href} onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 12,
              textDecoration: 'none',
              background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: active ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              fontSize: 14, fontWeight: active ? 600 : 400,
              transition: 'background 0.2s, color 0.2s, border 0.2s',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 19, flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </motion.div>
        )
      })}

      <div style={{ flex: 1 }} />
      <motion.div whileHover={{ scale: 1.03, x: 4 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }} style={{ marginTop: 16 }}>
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 14px', borderRadius: 12,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444', cursor: 'pointer',
          fontSize: 14, fontWeight: 600,
          transition: 'background 0.2s, color 0.2s, border 0.2s',
        }}>
          <span style={{ fontSize: 19, flexShrink: 0 }}>🚪</span>
          <span>Log Out</span>
        </button>
      </motion.div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{
        width: 220, minHeight: '100vh', background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        padding: '20px 12px', gap: 2, flexShrink: 0, position: 'sticky', top: 0, overflowY: 'auto',
      }}>
        <NavContent />
      </aside>

      {/* Mobile top navbar */}
      <nav className="mobile-navbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tutor Buddy</span>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 24, cursor: 'pointer', padding: 4 }}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 190 }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <aside style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 240,
            background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
            padding: '72px 12px 20px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto',
          }}>
            <NavContent />
          </aside>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-navbar { display: flex !important; }
        }
      `}</style>
    </>
  )
}
