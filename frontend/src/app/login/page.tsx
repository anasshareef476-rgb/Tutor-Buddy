'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { setToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const res = await fetch('http://localhost:8001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      
      setToken(data.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass" style={{ width: '100%', maxWidth: 400, padding: 40, borderRadius: 24, textAlign: 'center' }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Log in to continue your learning journey.</p>
        
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 14 }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input 
            type="email" placeholder="Email address" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', color: '#fff', fontSize: 15 }}
          />
          <input 
            type="password" placeholder="Password" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', color: '#fff', fontSize: 15 }}
          />
          <button 
            type="submit" disabled={loading}
            style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 16, marginTop: 8 }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <p style={{ marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
          Don't have an account? <Link href="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  )
}
