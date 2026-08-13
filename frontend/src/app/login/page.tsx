'use client'
import { useState } from 'react'
import Link from 'next/link'
import { setToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [view, setView] = useState<'main' | 'forgot'>('main')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setMessage('')
    try {
      const formData = new URLSearchParams()
      formData.append('username', email); formData.append('password', password)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      setToken(data.access_token); router.push('/dashboard')
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setMessage('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/auth/forgot-password`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to send reset link')
      
      if (data.token) {
        setMessage(data.message)
        setTimeout(() => {
          router.push(`/reset-password?token=${data.token}`)
        }, 1500)
      } else {
        setMessage(data.message)
      }
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="page-enter" style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'#fff', display:'grid', placeItems:'center', margin:'0 auto 16px', animation:'floatY 4s ease-in-out infinite', boxShadow:'0 8px 32px rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize:26 }}>🎓</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,38px)', fontWeight:400, letterSpacing:'-0.04em', color:'#fff', marginBottom:8 }}>
            {view === 'main' ? 'Welcome Back' : 'Reset Password'}
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>
            {view === 'main' ? 'Log in to continue your learning journey.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {error && (
          <div className="toast toast-error" style={{ marginBottom:20 }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:18 }}>×</button>
          </div>
        )}
        
        {message && (
          <div className="toast" style={{ marginBottom:20, background:'rgba(0,255,100,0.1)', border:'1px solid rgba(0,255,100,0.2)', color:'#0f0' }}>
            <span>{message}</span>
            <button onClick={() => setMessage('')} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:18 }}>×</button>
          </div>
        )}

        {view === 'main' ? (
          <>
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-dark" style={{ fontSize:15, padding:'14px 18px' }} />
              <div>
                <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="input-dark" style={{ fontSize:15, padding:'14px 18px', width:'100%' }} />
                <div style={{ textAlign:'right', marginTop:8 }}>
                  <button type="button" onClick={() => setView('forgot')} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer' }}>Forgot password?</button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-accent" style={{ width:'100%', padding:'14px', borderRadius:14, fontSize:15, marginTop:4 }}>
                {loading ? <span className="spinner" style={{ margin:'0 auto' }}/> : 'Log In'}
              </button>
            </form>

            <p style={{ marginTop:24, color:'var(--text-muted)', fontSize:14, textAlign:'center' }}>
              Don't have an account? <Link href="/register" style={{ color:'#fff', fontWeight:600 }}>Sign up</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleForgotPassword} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)}
              className="input-dark" style={{ fontSize:15, padding:'14px 18px' }} />
            <button type="submit" disabled={loading} className="btn-accent" style={{ width:'100%', padding:'14px', borderRadius:14, fontSize:15 }}>
              {loading ? <span className="spinner" style={{ margin:'0 auto' }}/> : 'Send Reset Link'}
            </button>
            <button onClick={() => { setView('main'); setMessage(''); setError('') }} type="button" className="btn-secondary" style={{ width:'100%', padding:'14px', borderRadius:14, fontSize:15, marginTop:8 }}>
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

