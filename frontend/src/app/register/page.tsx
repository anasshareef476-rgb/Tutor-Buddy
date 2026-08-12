'use client'
import { useState } from 'react'
import Link from 'next/link'
import { setToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:8001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      const loginRes = await fetch('http://localhost:8001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password }),
      })
      const loginData = await loginRes.json()
      if (loginRes.ok) { setToken(loginData.access_token); router.push('/dashboard') }
      else router.push('/login')
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="page-enter" style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'#fff', display:'grid', placeItems:'center', margin:'0 auto 16px', boxShadow:'0 8px 32px rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize:26 }}>🎓</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,38px)', fontWeight:400, letterSpacing:'-0.04em', color:'#fff', marginBottom:8 }}>Create Account</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Start your AI-powered learning journey today.</p>
        </div>

        {error && (
          <div className="toast toast-error" style={{ marginBottom:20 }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:18 }}>×</button>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} className="input-dark" style={{ fontSize:15, padding:'14px 18px' }} />
          <input type="password" placeholder="Password (min 6 chars)" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="input-dark" style={{ fontSize:15, padding:'14px 18px' }} />
          <button type="submit" disabled={loading} className="btn-accent" style={{ width:'100%', padding:'14px', borderRadius:14, fontSize:15, marginTop:4 }}>
            {loading ? <span className="spinner" style={{ margin:'0 auto' }}/> : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop:24, color:'var(--text-muted)', fontSize:14, textAlign:'center' }}>
          Already have an account? <Link href="/login" style={{ color:'#fff', fontWeight:600 }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

