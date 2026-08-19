'use client'
import { useState, useEffect, useRef } from 'react'

export default function NotesPage() {
  const [notes, setNotes] = useState<{ id: string; title: string; content: string; updated: string }[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('ai_tutor_notes')
    if (saved) setNotes(JSON.parse(saved))
  }, [])

  const save = (ns: typeof notes) => { setNotes(ns); localStorage.setItem('ai_tutor_notes', JSON.stringify(ns)) }

  const newNote = () => {
    const id = Date.now().toString()
    const note = { id, title: 'Untitled Note', content: '', updated: new Date().toISOString() }
    const updated = [note, ...notes]
    save(updated)
    setActive(id); setTitle(note.title); setContent('')
  }

  const openNote = (id: string) => {
    const n = notes.find(n => n.id === id)
    if (n) { setActive(id); setTitle(n.title); setContent(n.content) }
  }

  const updateNote = (newTitle: string, newContent: string) => {
    setTitle(newTitle); setContent(newContent)
    const updated = notes.map(n => n.id === active ? { ...n, title: newTitle, content: newContent, updated: new Date().toISOString() } : n)
    save(updated)
  }

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id)
    save(updated)
    if (active === id) { setActive(null); setTitle(''); setContent('') }
  }

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 64px)' }}>
      {/* Note list */}
      <div className="glass" style={{ width: 240, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flexShrink: 0 }}>
        <button className="btn-accent" onClick={newNote} style={{ width: '100%', marginBottom: 8 }}>+ New Note</button>
        {notes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>No notes yet</div>}
        {notes.map(note => (
          <div key={note.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => openNote(note.id)} style={{
              flex: 1, textAlign: 'left', background: active === note.id ? 'rgba(108,99,255,0.2)' : 'transparent',
              border: active === note.id ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
              borderRadius: 8, padding: '8px 10px', color: '#fff', cursor: 'pointer', fontSize: 13,
            }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{note.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{new Date(note.updated).toLocaleDateString()}</div>
            </button>
            <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>Ã—</button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {active ? (
          <>
            <input
              value={title}
              onChange={e => updateNote(e.target.value, content)}
              placeholder="Note title..."
              style={{ fontSize: 22, fontWeight: 700, background: 'transparent', border: 'none', outline: 'none', color: '#fff', marginBottom: 16, fontFamily: 'inherit' }}
            />
            <div className="glass" style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
              <textarea
                value={content}
                onChange={e => updateNote(title, e.target.value)}
                placeholder="Start writing your notes here... Use markdown syntax for formatting."
                style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 15, lineHeight: 1.8, fontFamily: 'inherit', padding: 24, resize: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📓</div>
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

