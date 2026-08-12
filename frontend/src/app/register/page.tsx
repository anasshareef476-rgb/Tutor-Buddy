'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      
      router.push('/login')
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
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Create an Account</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Start your personalized learning journey today.</p>
        
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 14 }}>{error}</div>}
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
          Already have an account? <Link href="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
        </p>
      </motion.div>
    </div>
  )
}
