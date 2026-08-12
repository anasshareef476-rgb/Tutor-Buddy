'use client'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
const api = {
  get: (p: string) => fetch(`${API_BASE}${p}`).then(r => r.json()),
  post: (p: string, b: any) => fetch(`${API_BASE}${p}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(b) }).then(r => r.json()),
  delete: (p: string) => fetch(`${API_BASE}${p}`, { method: 'DELETE' }).then(r => r.json()),
}

const getDecks = () => api.get('/flashcards/decks')
const createDeck = (name: string, description?: string) => api.post('/flashcards/decks', { name, description })
const deleteDeck = (id: number) => api.delete(`/flashcards/decks/${id}`)
const getDueCards = (id: number) => api.get(`/flashcards/decks/${id}/due`)
const reviewCard = (id: number, rating: string) => api.post(`/flashcards/cards/${id}/review`, { rating })
const addCard = (deckId: number, question: string, answer: string) => api.post(`/flashcards/decks/${deckId}/cards`, { question, answer })
const generateFlashcards = (deckId: number, text: string) => api.post('/flashcards/generate', { deck_id: deckId, text })

interface Deck { id: number; name: string; description?: string; total_cards: number; due_cards: number }
interface Card { id: number; question: string; answer: string; difficulty?: string }

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [dueCards, setDueCards] = useState<Card[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mode, setMode] = useState<'decks' | 'review' | 'add' | 'generate'>('decks')
  const [newDeckName, setNewDeckName] = useState('')
  const [newQ, setNewQ] = useState(''); const [newA, setNewA] = useState('')
  const [genText, setGenText] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadDecks() }, [])

  const loadDecks = async () => { try { setDecks(await getDecks()) } catch { } }

  const startReview = async (deck: Deck) => {
    setSelectedDeck(deck)
    const cards = await getDueCards(deck.id)
    setDueCards(cards)
    setReviewIndex(0)
    setFlipped(false)
    setMode('review')
  }

  const handleRate = async (rating: string) => {
    const card = dueCards[reviewIndex]
    await reviewCard(card.id, rating as any)
    if (reviewIndex + 1 >= dueCards.length) {
      setMsg('ðŸŽ‰ Session complete! All due cards reviewed.')
      setMode('decks'); loadDecks()
    } else {
      setReviewIndex(i => i + 1)
      setFlipped(false)
    }
  }

  const handleAddCard = async () => {
    if (!newQ || !newA || !selectedDeck) return
    setLoading(true)
    await addCard(selectedDeck.id, newQ, newA)
    setNewQ(''); setNewA('')
    setLoading(false)
    setMsg('Card added!')
    loadDecks()
  }

  const handleGenerateCards = async () => {
    if (!genText || !selectedDeck) return
    setLoading(true)
    const res = await generateFlashcards(selectedDeck.id, genText)
    setGenText('')
    setLoading(false)
    setMsg(`✨ Generated ${res.generated} flashcards!`)
    loadDecks()
    setMode('decks')
  }

  const currentCard = dueCards[reviewIndex]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }} className="fade-in">
      {msg && (
        <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, color: '#22c55e', fontSize: 14 }}>
          {msg} <button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}>Ã—</button>
        </div>
      )}

      {mode === 'decks' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 400 }}>ðŸƒ Flashcard Decks</h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={newDeckName} onChange={e => setNewDeckName(e.target.value)} placeholder="New deck name..." style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 14 }} />
              <button className="btn-accent" onClick={async () => { if (!newDeckName) return; await createDeck(newDeckName); setNewDeckName(''); loadDecks() }}>+ Create</button>
            </div>
          </div>

          {decks.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60 }}>No decks yet. Create your first deck above!</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {decks.map(deck => (
              <div key={deck.id} className="glass glass-hover" style={{ borderRadius: 16, padding: 20, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{deck.name}</h3>
                  <button onClick={() => deleteDeck(deck.id).then(loadDecks)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>ðŸ—‘</button>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}><strong style={{ color: '#fff' }}>{deck.total_cards}</strong> cards</div>
                  <div style={{ fontSize: 13, color: deck.due_cards > 0 ? '#f59e0b' : 'var(--text-secondary)' }}><strong>{deck.due_cards}</strong> due</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => { setSelectedDeck(deck); setMode('add') }} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer' }}>+ Add Card</button>
                  <button onClick={() => { setSelectedDeck(deck); setMode('generate') }} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer' }}>✨ AI Generate</button>
                  {deck.due_cards > 0 && <button className="btn-accent" onClick={() => startReview(deck)} style={{ fontSize: 12, padding: '5px 14px' }}>Review</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {mode === 'review' && currentCard && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <button onClick={() => { setMode('decks'); loadDecks() }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>← Back</button>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{reviewIndex + 1} / {dueCards.length}</span>
          </div>

          {/* Flashcard */}
          <div
            onClick={() => setFlipped(f => !f)}
            style={{
              background: flipped ? 'rgba(255,255,255,0.08)' : '#111113',
              border: `1px solid ${flipped ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`,
              borderRadius: 20, padding: '60px 40px', cursor: 'pointer', minHeight: 240,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              transition: 'all 0.3s', marginBottom: 24,
              boxShadow: flipped ? '0 8px 40px rgba(255,255,255,0.08)' : 'none',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{flipped ? 'Answer' : 'Question — click to flip'}</div>
            <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.6 }}>{flipped ? currentCard.answer : currentCard.question}</div>
          </div>

          {flipped && (
            <div className="fade-in" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {[
                { label: '😟 Again', rating: 'again', color: '#ef4444' },
                { label: '😐 Hard', rating: 'hard', color: '#f59e0b' },
                { label: '🙂 Good', rating: 'good', color: '#22c55e' },
                { label: '😄 Easy', rating: 'easy', color: '#6c63ff' },
              ].map(r => (
                <button key={r.rating} onClick={() => handleRate(r.rating)} style={{
                  padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14,
                  background: `${r.color}18`, border: `1px solid ${r.color}55`, color: r.color, cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}>{r.label}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {(mode === 'add' || mode === 'generate') && (
        <div>
          <button onClick={() => setMode('decks')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>← Back to decks</button>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{mode === 'add' ? `Add Card to "${selectedDeck?.name}"` : `AI Generate Cards for "${selectedDeck?.name}"`}</h2>

          {mode === 'add' ? (
            <div className="glass" style={{ borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Question..." style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14 }} />
              <textarea value={newA} onChange={e => setNewA(e.target.value)} placeholder="Answer..." rows={4} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />
              <button className="btn-accent" onClick={handleAddCard} disabled={loading || !newQ || !newA} style={{ alignSelf: 'flex-start' }}>Add Flashcard</button>
            </div>
          ) : (
            <div className="glass" style={{ borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Paste text from your notes, PDF content, or any study material. The AI will generate flashcards automatically.</p>
              <textarea value={genText} onChange={e => setGenText(e.target.value)} placeholder="Paste your study text here..." rows={8} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />
              <button className="btn-accent" onClick={handleGenerateCards} disabled={loading || !genText} style={{ alignSelf: 'flex-start' }}>
                {loading ? '✨ Generating...' : '✨ Generate with AI'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

