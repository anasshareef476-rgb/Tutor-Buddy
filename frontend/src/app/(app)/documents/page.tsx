'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = 'http://localhost:8001/api/v1'
const getDocuments = () => fetch(`${API_BASE}/documents/`).then(r => r.json())
const deleteDocument = (id: number) => fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' }).then(r => r.json())
const uploadDocument = (file: File) => {
  const form = new FormData(); form.append('file', file)
  return fetch(`${API_BASE}/documents/upload`, { method: 'POST', body: form }).then(r => r.json())
}

interface Document { id: number; filename: string; file_type: string; status: string; created_at: string }

export default function DocumentsPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadDocs() }, [])

  const loadDocs = async () => { try { setDocs(await getDocuments()) } catch { } }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadDocument(file)
      setMsg(`✅ "${file.name}" uploaded and queued for processing!`)
      await loadDocs()
    } catch (err: any) {
      setMsg('❌ Upload failed. Check backend is running.')
    } finally { setUploading(false) }
  }

  const statusColor: Record<string, string> = {
    completed: '#22c55e', processing: '#f59e0b', pending: '#6c63ff', error: '#ef4444'
  }
  const statusIcon: Record<string, string> = {
    completed: '✅', processing: '⚙️', pending: '⏳', error: '❌'
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>📄 Documents</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Upload PDFs, notes, and files to power the AI Tutor with your course material.</p>
        </div>
        <label className="btn-accent" style={{ cursor: 'pointer' }}>
          {uploading ? '⏳ Uploading...' : '+ Upload File'}
          <input type="file" accept=".pdf,.txt,.docx" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      {msg && (
        <div style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 14 }}>
          {msg} <button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Supported formats info */}
      <div className="glass" style={{ borderRadius: 12, padding: '12px 20px', marginBottom: 24, display: 'flex', gap: 20 }}>
        {[['📄 PDF', 'Lecture slides, textbooks'], ['📝 TXT', 'Plain text notes'], ['📃 DOCX', 'Word documents']].map(([fmt, desc]) => (
          <div key={fmt} style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{fmt}</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{desc}</span>
          </div>
        ))}
      </div>

      {docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No documents uploaded yet</h3>
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
              <div style={{ fontSize: 28 }}>
                {doc.file_type === 'pdf' ? '📕' : doc.file_type === 'txt' ? '📄' : '📃'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{doc.file_type.toUpperCase()} · {new Date(doc.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${statusColor[doc.status] || '#888'}18`, border: `1px solid ${statusColor[doc.status] || '#888'}44`, fontSize: 13, color: statusColor[doc.status] || '#888' }}>
                <span>{statusIcon[doc.status] || '?'}</span>
                <span style={{ textTransform: 'capitalize' }}>{doc.status}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id).then(loadDocs) }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: 4 }}
                title="Delete document"
              >🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
