'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
const getDocuments = () => fetch(`${API_BASE}/documents/`).then(r => r.json())
const deleteDocument = (id: number) => fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' }).then(r => r.json())
const uploadDocument = (file: File) => {
  const form = new FormData(); form.append('file', file)
  return fetch(`${API_BASE}/documents/upload`, { method: 'POST', body: form }).then(r => r.json())
}
interface Document { id: number; filename: string; file_type: string; status: string; created_at: string }
const statusColor: Record<string,string> = { completed: '#22c55e', processing: '#f59e0b', pending: 'rgba(255,255,255,0.4)', error: '#ef4444' }

export default function DocumentsPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success'|'error'|'info'>('info')

  const [pollTrigger, setPollTrigger] = useState(0)
  
  useEffect(() => {
    let active = true
    const poll = async () => {
      if (!active) return
      try {
        const data = await getDocuments()
        if (!active) return
        setDocs(data)
        const hasProcessing = data.some((d: Document) => d.status === 'processing' || d.status === 'pending')
        if (hasProcessing) {
          setTimeout(poll, 2000)
        }
      } catch {}
    }
    poll()
    return () => { active = false }
  }, [pollTrigger])

  const loadDocs = () => setPollTrigger(p => p + 1)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadDocument(file)
      setMsg(`"${file.name}" uploaded and queued for processing!`)
      setMsgType('success')
      await loadDocs()
    } catch { setMsg('Upload failed. Check backend is running.'); setMsgType('error') }
    finally { setUploading(false) }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 400, letterSpacing: '-0.04em', color: '#fff', marginBottom: 8 }}>
            Documents
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Upload PDFs, notes and files to power the AI Tutor with your material.</p>
        </div>
        <label className="btn-accent" style={{ cursor: 'pointer' }}>
          {uploading ? '⏳ Uploading...' : '+ Upload File'}
          <input type="file" accept=".pdf,.txt,.docx" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      {msg && (
        <div className={`toast toast-${msgType}`} style={{ marginBottom: 20 }}>
          <span>{msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1, marginLeft: 12 }}>×</button>
        </div>
      )}

      <div className="glass" style={{ borderRadius: 14, padding: '12px 20px', marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[['◻ PDF', 'Lecture slides, textbooks'], ['◻ TXT', 'Plain text notes'], ['◻ DOCX', 'Word documents']].map(([fmt, desc]) => (
          <div key={fmt} style={{ fontSize: 13 }}>
            <span style={{ fontFamily: 'var(--font-display)', color: '#fff', marginRight: 6 }}>{fmt}</span>
            <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
          </div>
        ))}
      </div>

      {docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, marginBottom: 16, color: 'rgba(255,255,255,0.2)' }}>◻</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8, color: '#fff', fontSize: 18 }}>No documents uploaded yet</h3>
          <p style={{ fontSize: 14 }}>Upload a PDF or text file to get started with RAG-powered AI Tutor.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {docs.map(doc => (
            <div
              key={doc.id}
              onClick={() => router.push(`/documents/${doc.id}`)}
              className="glass glass-hover"
              style={{ borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>◻</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{doc.file_type.toUpperCase()} · {new Date(doc.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: `${statusColor[doc.status] || '#888'}1a`, border: `1px solid ${statusColor[doc.status] || '#888'}44`, fontSize: 12, color: statusColor[doc.status] || '#888', flexShrink: 0, textTransform: 'capitalize' }}>
                {(doc.status === 'processing' || doc.status === 'pending') && <span style={{ display: 'inline-block', animation: 'spin 2s linear infinite' }}>⏳</span>}
                {doc.status}
              </div>
              <button onClick={e => { e.stopPropagation(); deleteDocument(doc.id).then(loadDocs) }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0 }} title="Delete">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
