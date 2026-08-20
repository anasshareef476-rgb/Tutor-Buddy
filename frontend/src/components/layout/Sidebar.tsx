'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', icon: '⌂', label: 'Dashboard' },
  { href: '/chat',       icon: '◈', label: 'AI Chat' },
  { href: '/flashcards', icon: '◇', label: 'Flashcards' },
  { href: '/documents',  icon: '◻', label: 'Documents' },
  { href: '/quiz',       icon: '◉', label: 'Quiz' },
  { href: '/notes',      icon: '◈', label: 'Notes' },
  { href: '/roadmap',    icon: '◎', label: 'Roadmap' },
  { href: '/progress',   icon: '#', label: 'Progress' },
  { href: '/contact',    icon: '✉', label: 'Contact Support' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLinks = ({ dark = true, onClose }: { dark?: boolean; onClose?: () => void }) => (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
      {navItems.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        const inactiveColor = dark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.45)'
        const activeColor   = dark ? '#ffffff' : '#000000'
        const activeBg      = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
        const activeBorder  = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
        const dotColor      = dark ? '#fff' : '#000'
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="nav-item"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              background: active ? activeBg : 'transparent',
              border: `1px solid ${active ? activeBorder : 'transparent'}`,
              color: active ? activeColor : inactiveColor,
              fontSize: 14, fontWeight: active ? 600 : 400,
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
              marginBottom: 2,
              position: 'relative',
              textDecoration: 'none',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, flexShrink: 0,
              color: active ? activeColor : inactiveColor,
            }}>{item.icon}</span>
            <span>{item.label}</span>
            {active && (
              <span style={{
                position: 'absolute', bottom: 6, left: '50%',
                transform: 'translateX(-50%)',
                width: 3, height: 3, borderRadius: '50%', background: dotColor,
                boxShadow: `-5px 0 0 ${dotColor}, 5px 0 0 ${dotColor}`,
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar scanlines" style={{
        width: 220, minHeight: '100vh',
        background: '#000',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px', gap: 2,
        flexShrink: 0, position: 'sticky', top: 0, overflowY: 'auto',
      }}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '4px 8px' }}>
          <div className="logo-ring" style={{
            width: 36, height: 36, borderRadius: '50%', background: '#fff',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          }}>
            <span style={{ fontSize: 18 }}>🎓</span>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400, fontSize: 17, color: '#fff',
            letterSpacing: '-0.04em',
          }}>Tutor Buddy</span>
        </div>

        <NavLinks dark={true} />

        {/* Logout */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={logout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 12,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.18)',
            color: '#ef4444', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)',
            transition: 'background 0.2s',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>×</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <nav className="mobile-navbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: '#000', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '10px 16px', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#fff',
            display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}>
            <span style={{ fontSize: 16 }}>🎓</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', letterSpacing: '-0.04em' }}>
            Tutor Buddy
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            gap: 5, width: 40, height: 40, borderRadius: '50%',
            background: mobileOpen ? '#fff' : '#28282a',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'background 0.2s',
          }}
        >
          {mobileOpen ? (
            <span style={{ color: '#000', fontSize: 18, fontFamily: 'var(--font-display)', lineHeight: 1 }}>×</span>
          ) : (
            <>
              <span style={{ display: 'block', width: 16, height: 1.5, background: '#fff', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 16, height: 1.5, background: '#fff', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 16, height: 1.5, background: '#fff', borderRadius: 2 }} />
            </>
          )}
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 190 }}>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(6px)' }}
          />
          <div style={{
            position: 'absolute', top: 60, left: 12, right: 12,
            background: '#fff', borderRadius: 24,
            padding: '20px 16px', maxWidth: 360, margin: '0 auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <NavLinks dark={false} onClose={() => setMobileOpen(false)} />
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              <button onClick={() => { setMobileOpen(false); logout() }} style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span>×</span> Log Out
              </button>
            </div>
          </div>
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

