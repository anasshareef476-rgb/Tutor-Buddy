'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { use } from 'react'

const API_BASE = 'http://localhost:8001/api/v1'

interface Document {
  id: number
  filename: string
  file_type: string
  status: string
  created_at: string
  content?: string
}

export default function DocumentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/documents/${resolvedParams.id}`)
      .then(r => {
        if (!r.ok) throw new Error('Document not found')
        return r.json()
      })
      .then(data => {
        setDoc(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [resolvedParams.id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}><span className="spinner" style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }} /> Loading...</div>
  
  if (error || !doc) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      <h2>❌ Error</h2>
      <p>{error || 'Document not found'}</p>
      <Link href="/documents" style={{ color: 'var(--accent)', marginTop: 20, display: 'inline-block' }}>← Back to Documents</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Link href="/documents" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span>←</span> Back to Documents
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>
              {doc.file_type === 'pdf' ? '📕' : doc.file_type === 'txt' ? '📄' : '📃'}
            </span>
            {doc.filename}
          </h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span>{new Date(doc.created_at).toLocaleString()}</span>
            <span style={{ 
              padding: '2px 8px', borderRadius: 12, fontSize: 12,
              background: doc.status === 'completed' ? '#22c55e22' : '#f59e0b22',
              color: doc.status === 'completed' ? '#22c55e' : '#f59e0b',
            }}>
              {doc.status.toUpperCase()}
            </span>
          </div>
        </div>

        <button 
          onClick={() => router.push(`/chat?docName=${encodeURIComponent(doc.filename)}`)}
          style={{
            background: 'var(--gradient-1)', border: 'none', borderRadius: 12, padding: '12px 20px', 
            color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 15,
            boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span>🎓</span> Ask AI about this document
        </button>
      </div>

      {/* Content */}
      <div className="glass" style={{ flex: 1, borderRadius: 16, padding: 24, overflowY: 'auto', border: '1px solid var(--border)' }}>
        {doc.status === 'pending' || doc.status === 'processing' ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent', width: 30, height: 30, marginBottom: 16 }} />
            <p>Document is being processed. Text will appear here shortly...</p>
          </div>
        ) : doc.status === 'error' ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>
            <p>❌ Failed to extract text from this document.</p>
          </div>
        ) : !doc.content ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <p>No text could be extracted from this document. It might be an image-only PDF or empty.</p>
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-geist-mono)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {doc.content}
          </div>
        )}
      </div>
    </div>
  )
}
