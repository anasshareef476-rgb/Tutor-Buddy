'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = 'http://localhost:8001/api/v1'

async function apiPost(path: string, body: any) {
  const isFormData = body instanceof FormData
  const options: RequestInit = {
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
  }
  if (!isFormData) {
    options.headers = { 'Content-Type': 'application/json' }
  }
  const res = await fetch(`${API_BASE}${path}`, options)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  return res.json()
}

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

interface Message { id?: number; role: string; content: string }
interface Chat { id: number; title: string }

function ChatInterface() {
  const searchParams = useSearchParams()
  const docName = searchParams.get('docName')
  
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(docName ? `Can you summarize ${docName} for me?` : '')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadChats() }, [])
  
  // Auto-send if we came from a document
  const hasAutoSent = useRef(false)
  useEffect(() => {
    if (docName && !hasAutoSent.current && messages.length === 0) {
      hasAutoSent.current = true
      const initialMsg = `Can you summarize ${docName} for me and give me 3 key takeaways?`
      setInput(initialMsg)
      setTimeout(() => handleSend(initialMsg), 100)
    }
  }, [docName, messages.length])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadChats = async () => {
    try { setChats(await apiGet('/chats/')) } catch { }
  }

  const loadMessages = async (chatId: number) => {
    try {
      setActiveChatId(chatId)
      const msgs = await apiGet(`/chats/${chatId}/messages`)
      setMessages(msgs)
      setSidebarOpen(false)
    } catch { }
  }

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput !== undefined ? overrideInput : input
    if (!textToSend.trim() || loading) return
    const userContent = textToSend

    const userMsg: Message = { role: 'user', content: userContent }
    setMessages(prev => [...prev, userMsg, { role: 'ai', content: '__loading__' }])
    
    if (overrideInput === undefined) {
      setInput('')
    }
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('message', textToSend)
      if (activeChatId) formData.append('chat_id', activeChatId.toString())

      const res = await apiPost('/chats/', formData)
      setActiveChatId(res.chat_id)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'ai', content: res.ai_response }
        return updated
      })
      loadChats()
    } catch (e: any) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'ai', content: `❌ **Error**: ${e.message || 'Failed to connect to AI backend. Make sure the server is running on port 8001.'}` }
        return updated
      })
    } finally { setLoading(false) }
  }

  const suggestions = [
    'Explain recursion with an example',
    'What is the water cycle?',
    'Help me understand Big O notation',
    'Explain photosynthesis step by step',
    'What is machine learning?',
    'How do neural networks work?',
  ]

  const RATE_LIMIT_MSG = 'rate_limit_exceeded'

  return (
    <div style={{ display: 'flex', height: '100%', gap: 16, position: 'relative' }}>
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        style={{
          display: 'none',
          position: 'fixed', top: 16, left: 16, zIndex: 100,
          background: 'var(--accent)', border: 'none', borderRadius: 8,
          padding: '8px 12px', color: 'white', cursor: 'pointer', fontSize: 16,
        }}
        className="mobile-menu-btn"
      >☰</button>

      {/* Sidebar */}
      <div className={`chat-sidebar glass ${sidebarOpen ? 'open' : ''}`} style={{
        width: 240, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, overflowY: 'auto',
      }}>
        <button
          onClick={() => { setActiveChatId(null); setMessages([]); setSidebarOpen(false) }}
          style={{ background: 'var(--gradient-1)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
          + New Chat
        </button>
        {chats.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>No chats yet.<br />Start a new conversation!</div>}
        {chats.map(chat => (
          <div key={chat.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => loadMessages(chat.id)} style={{
              flex: 1, textAlign: 'left',
              background: activeChatId === chat.id ? 'rgba(108,99,255,0.2)' : 'transparent',
              border: activeChatId === chat.id ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
              borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{chat.title}</button>
            <button onClick={() => apiDelete(`/chats/${chat.id}`).then(loadChats)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        ))}
      </div>

      {/* Chat main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 20 }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎓</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tutor Buddy is Ready</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 28 }}>Ask me anything — concepts, code, math, science, or any subject.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 600, margin: '0 auto' }}>
                {suggestions.map(s => (
                  <motion.button key={s} whileHover={{ scale: 1.05, borderColor: '#0ea5e9', color: '#fff' }} whileTap={{ scale: 0.95 }} onClick={() => setInput(s)} style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
                    padding: '8px 16px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
                    backdropFilter: 'blur(10px)',
                  }}
                  >{s}</motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', padding: '0 4px' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 10, marginTop: 4 }}>🎓</div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.03)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontSize: 14, lineHeight: 1.75, color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                  wordBreak: 'break-word', backdropFilter: msg.role === 'user' ? 'none' : 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  {msg.content === '__loading__' ? (
                    <span style={{ display: 'flex', gap: 5, alignItems: 'center', height: 22 }}>
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                    </span>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="glass" style={{ borderRadius: 16, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-end', border: '1px solid var(--border)' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Ask anything... (Enter to send)"
              rows={1}
              disabled={loading}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, maxHeight: 120, overflowY: 'auto',
                fontFamily: 'inherit', minWidth: 0,
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? 'var(--bg-card-hover)' : 'var(--gradient-1)',
                border: 'none', borderRadius: 12, padding: '10px 18px', color: 'white',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14,
                flexShrink: 0, transition: 'all 0.2s',
              }}>
              {loading ? <span className="spinner" style={{ margin: '0 6px' }} /> : '→'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .chat-sidebar {
            position: fixed !important; top: 0; left: -260px; height: 100vh; z-index: 99;
            transition: left 0.25s ease; border-radius: 0 !important; width: 240px !important;
          }
          .chat-sidebar.open { left: 0 !important; }
        }
      `}</style>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <ChatInterface />
    </Suspense>
  )
}
