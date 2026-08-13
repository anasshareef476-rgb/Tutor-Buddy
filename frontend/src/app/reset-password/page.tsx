'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.')
    }
  }, [token])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return setError('Invalid reset token.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    
    setLoading(true); setError(''); setMessage('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/auth/reset-password`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ token, new_password: password }) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to reset password')
      
      setMessage('Password reset successfully! Redirecting to login...')
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: any) { 
      setError(err.message) 
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="page-enter" style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div className="logo-ring" style={{ width:56, height:56, borderRadius:'50%', background:'#fff', display:'grid', placeItems:'center', margin:'0 auto 16px', boxShadow:'0 8px 32px rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize:26 }}>🔒</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,38px)', fontWeight:400, letterSpacing:'-0.04em', color:'#fff', marginBottom:8 }}>Set New Password</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Please enter your new password below.</p>
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

        {token ? (
          <form onSubmit={handleReset} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <input type="password" placeholder="New password" required value={password} onChange={e => setPassword(e.target.value)}
              className="input-dark" style={{ fontSize:15, padding:'14px 18px' }} />
            <input type="password" placeholder="Confirm new password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="input-dark" style={{ fontSize:15, padding:'14px 18px' }} />
            
            <button type="submit" disabled={loading} className="btn-accent" style={{ width:'100%', padding:'14px', borderRadius:14, fontSize:15, marginTop:4 }}>
              {loading ? <span className="spinner" style={{ margin:'0 auto' }}/> : 'Reset Password'}
            </button>
          </form>
        ) : (
          <Link href="/login" style={{ display:'block', textAlign:'center', color:'#fff', fontWeight:600, padding:14, background:'rgba(255,255,255,0.1)', borderRadius:14 }}>
            Go back to Login
          </Link>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#000', display:'grid', placeItems:'center' }}><span className="spinner" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
