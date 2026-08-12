'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
async function apiPost(path: string, body: any) {
  const isFormData = body instanceof FormData
  const options: RequestInit = { method: 'POST', body: isFormData ? body : JSON.stringify(body) }
  if (!isFormData) options.headers = { 'Content-Type': 'application/json' }
  const res = await fetch(`${API_BASE}${path}`, options)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
async function apiGet(path: string) { const res = await fetch(`${API_BASE}${path}`); if (!res.ok) throw new Error(await res.text()); return res.json() }
async function apiDelete(path: string) { const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' }); if (!res.ok) throw new Error(''); return res.json() }
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
  const hasAutoSent = useRef(false)
  useEffect(() => {
    if (docName && !hasAutoSent.current && messages.length === 0) {
      hasAutoSent.current = true
      const msg = `Can you summarize ${docName} for me and give me 3 key takeaways?`
      setInput(msg); setTimeout(() => handleSend(msg), 100)
    }
  }, [docName, messages.length])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadChats = async () => { try { setChats(await apiGet('/chats/')) } catch { } }
  const loadMessages = async (chatId: number) => {
    try { setActiveChatId(chatId); const msgs = await apiGet(`/chats/${chatId}/messages`); setMessages(msgs); setSidebarOpen(false) } catch { }
  }

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput !== undefined ? overrideInput : input
    if (!textToSend.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', content: textToSend }, { role: 'ai', content: '__loading__' }])
    if (overrideInput === undefined) setInput('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('message', textToSend)
      if (activeChatId) formData.append('chat_id', activeChatId.toString())
      const res = await apiPost('/chats/', formData)
      setActiveChatId(res.chat_id)
      setMessages(prev => { const u = [...prev]; u[u.length-1] = { role: 'ai', content: res.ai_response }; return u })
      loadChats()
    } catch (e: any) {
      setMessages(prev => { const u = [...prev]; u[u.length-1] = { role: 'ai', content: `Error: ${e.message}` }; return u })
    } finally { setLoading(false) }
  }

  const suggestions = ['Explain recursion with an example','What is the water cycle?','Help me understand Big O notation','Explain photosynthesis','What is machine learning?','How do neural networks work?']

  return (
    <div style={{ display: 'flex', height: '100%', gap: 16, position: 'relative' }}>
      <button onClick={() => setSidebarOpen(o => !o)} style={{ display:'none', position:'fixed', top:80, left:12, zIndex:100, background:'#28282a', border:'none', borderRadius:10, padding:'8px 12px', color:'white', cursor:'pointer', fontSize:14 }} className="mobile-menu-btn">☰</button>

      {/* Chat history sidebar */}
      <div className={`chat-sidebar glass ${sidebarOpen ? 'open' : ''}`} style={{ width:240, borderRadius:18, padding:16, display:'flex', flexDirection:'column', gap:8, flexShrink:0, overflowY:'auto' }}>
        <button onClick={() => { setActiveChatId(null); setMessages([]); setSidebarOpen(false) }} className="btn-accent" style={{ borderRadius:12, padding:'10px', fontSize:13, marginBottom:4 }}>+ New Chat</button>
        {chats.length === 0 && <div style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', marginTop:20 }}>No chats yet.<br/>Start a conversation!</div>}
        {chats.map(chat => (
          <div key={chat.id} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button onClick={() => loadMessages(chat.id)} style={{ flex:1, textAlign:'left', background: activeChatId===chat.id ? 'rgba(255,255,255,0.08)' : 'transparent', border: activeChatId===chat.id ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent', borderRadius:10, padding:'8px 10px', color:'#fff', cursor:'pointer', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{chat.title}</button>
            <button onClick={() => apiDelete(`/chats/${chat.id}`).then(loadChats)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18 }}>×</button>
          </div>
        ))}
      </div>

      {/* Main chat area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <div style={{ flex:1, overflowY:'auto', paddingBottom:16, display:'flex', flexDirection:'column', gap:14 }}>
          {messages.length === 0 && (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.4 }} style={{ textAlign:'center', paddingTop:60, paddingBottom:20 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:52, marginBottom:16, color:'rgba(255,255,255,0.25)' }}>*</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,3vw,36px)', letterSpacing:'-0.04em', color:'#fff', marginBottom:8 }}>Tutor Buddy</h2>
              <p style={{ color:'var(--text-muted)', fontSize:15, marginBottom:28 }}>Ask me anything — concepts, code, math, science, or any subject.</p>
              <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', maxWidth:600, margin:'0 auto' }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => setInput(s)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:999, padding:'8px 16px', color:'var(--text-muted)', cursor:'pointer', fontSize:13, transition:'all 0.2s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.borderColor='rgba(255,255,255,0.3)'; (e.target as HTMLElement).style.color='#fff' }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.borderColor='rgba(255,255,255,0.1)'; (e.target as HTMLElement).style.color='var(--text-muted)' }}
                  >{s}</button>
                ))}
              </div>
            </motion.div>
          )}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start', padding:'0 4px' }}>
                {msg.role === 'ai' && <div style={{ width:30, height:30, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, marginRight:10, marginTop:4, fontFamily:'var(--font-display)' }}>*</div>}
                <div style={{ maxWidth:'80%', padding:'12px 16px', borderRadius: msg.role==='user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px', background: msg.role==='user' ? '#fff' : 'rgba(255,255,255,0.04)', border: msg.role==='user' ? 'none' : '1px solid rgba(255,255,255,0.08)', fontSize:14, lineHeight:1.75, color: msg.role==='user' ? '#000' : '#fff', wordBreak:'break-word' }}>
                  {msg.content === '__loading__' ? <span style={{ display:'flex', gap:5, alignItems:'center', height:22 }}><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></span> : <div style={{ whiteSpace:'pre-wrap' }}>{msg.content}</div>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding:'0 0 16px 0' }}>
          <div className="glass" style={{ borderRadius:18, padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-end', border:'1px solid rgba(255,255,255,0.1)' }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend()} }} placeholder="Ask anything… (Enter to send)" rows={1} disabled={loading} style={{ flex:1, background:'transparent', border:'none', outline:'none', resize:'none', color:'#fff', fontSize:14, lineHeight:1.6, maxHeight:120, overflowY:'auto', fontFamily:'inherit', minWidth:0 }} />
            <button onClick={() => handleSend()} disabled={loading||!input.trim()} className="btn-accent" style={{ borderRadius:12, padding:'10px 18px', minWidth:44, flexShrink:0 }}>
              {loading ? <span className="spinner"/> : '→'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .mobile-menu-btn { display: block !important; } .chat-sidebar { position:fixed !important; top:0; left:-260px; height:100vh; z-index:99; transition:left 0.25s ease; border-radius:0 !important; width:240px !important; } .chat-sidebar.open { left:0 !important; } }
      `}</style>
    </div>
  )
}

export default function ChatPage() {
  return <Suspense fallback={<div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Loading...</div>}><ChatInterface /></Suspense>
}
