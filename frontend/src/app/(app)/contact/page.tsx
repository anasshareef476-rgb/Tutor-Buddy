'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{type: 'success'|'error', msg: string} | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('message', message)
      if (file) formData.append('file', file)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/contact`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to send message')
      
      setStatus({ type: 'success', msg: data.message || 'Your message was sent successfully!' })
      setName(''); setEmail(''); setMessage(''); setFile(null)
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, marginBottom: 16 }}>Contact Support</h1>
        <p style={{ color: 'var(--text-muted)' }}>Have a complaint, feedback, or need help? Send a direct message with any files attached.</p>
      </div>

      {status && (
        <div className={`toast ${status.type === 'error' ? 'toast-error' : ''}`} style={{ marginBottom: 24, background: status.type === 'success' ? 'rgba(0,255,100,0.1)' : undefined, border: status.type === 'success' ? '1px solid rgba(0,255,100,0.2)' : undefined, color: status.type === 'success' ? '#0f0' : undefined }}>
          <span>{status.msg}</span>
          <button onClick={() => setStatus(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}

      <div className="glass" style={{ padding: 32, borderRadius: 24, border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Your Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-dark" style={{ width: '100%', padding: '12px 16px' }} placeholder="John Doe" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Your Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-dark" style={{ width: '100%', padding: '12px 16px' }} placeholder="john@example.com" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Message / Complaint</label>
            <textarea required value={message} onChange={e => setMessage(e.target.value)} className="input-dark" style={{ width: '100%', padding: '12px 16px', minHeight: 120, resize: 'vertical' }} placeholder="Describe your issue..." />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Attachment (Optional)</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="input-dark" style={{ width: '100%', padding: '10px 16px' }} />
          </div>

          <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%', padding: '16px', borderRadius: 14, fontSize: 16, marginTop: 10, fontWeight: 700 }}>
            {loading ? <span className="spinner" style={{ margin: '0 auto' }}/> : 'Send Message 📨'}
          </button>
        </form>
      </div>
    </div>
  )
}
