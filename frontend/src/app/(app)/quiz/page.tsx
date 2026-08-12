'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getToken } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function QuizPage() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [questionCount, setQuestionCount] = useState(5)

  const generateQuiz = async () => {
    if (!topic.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count: questionCount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to generate quiz')
      if (!data.questions || data.questions.length === 0) throw new Error('AI returned no questions. This may be a rate limit issue. Please try again in a moment.')
      setQuiz(data.questions)
      setCurrent(0); setSelected(null); setScore(0); setDone(false)
    } catch (e: any) {
      setError(e.message || 'Failed to generate quiz')
    } finally { setLoading(false) }
  }

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === quiz[current].correct) setScore(s => s + 1)
  }

  const handleNext = () => {
    if (current + 1 >= quiz.length) {
      setDone(true)
      const token = getToken()
      if (token) {
        fetch(`${API_BASE}/progress/quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ score, questions: quiz.length })
        }).catch(console.error)
      }
      return
    }
    setCurrent(c => c + 1); setSelected(null)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }} className="fade-in">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>ðŸ“ AI Quiz Generator</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>Generate instant quizzes on any topic using Tutor Buddy.</motion.p>

      <AnimatePresence mode="wait">
      {quiz.length === 0 && !loading && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="glass" style={{ borderRadius: 20, padding: '32px 28px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} style={{ fontSize: 52, marginBottom: 20 }}>🎯</motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>What would you like to be quizzed on?</h2>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 14, textAlign: 'left' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateQuiz()}
              placeholder="e.g. Binary Search Trees, Photosynthesis, WW2..."
              style={{
                flex: 1, minWidth: 220, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '12px 18px', color: '#fff', fontSize: 15,
              }}
            />
            <select
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '12px 18px', color: '#fff', fontSize: 15,
                cursor: 'pointer', outline: 'none'
              }}
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={generateQuiz} disabled={!topic.trim()}
              style={{
                background: '#fff', color: '#000', border: 'none',
                borderRadius: 12, padding: '12px 24px', color: 'white', fontWeight: 700,
                cursor: topic.trim() ? 'pointer' : 'not-allowed', fontSize: 15, whiteSpace: 'nowrap',
                opacity: topic.trim() ? 1 : 0.6
              }}>
              Generate Quiz →
            </motion.button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['React Hooks', 'Linear Algebra', 'World War II', 'DNA Replication', 'Python Decorators', 'Data Structures'].map(t => (
              <motion.button whileHover={{ scale: 1.05, backgroundColor: 'rgba(59,130,246,0.1)' }} whileTap={{ scale: 0.95 }} key={t} onClick={() => setTopic(t)} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
                padding: '7px 16px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13,
              }}>{t}</motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div className="spinner" style={{ margin: '0 auto 20px', width: 40, height: 40 }} />
          <p style={{ color: 'var(--text-muted)' }}>Generating quiz on "<strong>{topic}</strong>"...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>This may take a few seconds</p>
        </div>
      )}

      {quiz.length > 0 && !done && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key={current}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Question {current + 1} of {quiz.length} • <strong style={{ color: '#fff' }}>{topic}</strong></span>
            <span style={{ color: '#3b82f6', fontSize: 14, fontWeight: 700 }}>Score: {score}/{current}</span>
          </div>

          <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
            <motion.div initial={{ width: `${(current / quiz.length) * 100}%` }} animate={{ width: `${((current + 1) / quiz.length) * 100}%` }} style={{ height: '100%', background: '#fff', color: '#000', borderRadius: 2 }} />
          </div>

          <div className="glass" style={{ borderRadius: 20, padding: '28px 24px', marginBottom: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65, marginBottom: 22 }}>{quiz[current].question}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quiz[current].options.map((opt, i) => {
                const isCorrect = i === quiz[current].correct
                const isSelected = i === selected
                let bg = 'rgba(255,255,255,0.08)', border = 'var(--border)', color = 'var(--text-primary)'
                if (selected !== null) {
                  if (isCorrect) { bg = 'rgba(34,197,94,0.15)'; border = '#22c55e'; color = '#22c55e' }
                  else if (isSelected) { bg = 'rgba(239,68,68,0.12)'; border = '#ef4444'; color = '#ef4444' }
                }
                return (
                  <motion.button whileHover={selected === null ? { scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' } : {}} whileTap={selected === null ? { scale: 0.98 } : {}} key={i} onClick={() => handleSelect(i)} style={{
                    textAlign: 'left', padding: '13px 16px', borderRadius: 12, fontSize: 14, lineHeight: 1.5,
                    background: bg, border: `1px solid ${border}`, color, cursor: selected === null ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                  }}>
                    <span style={{ fontWeight: 700, marginRight: 10, color: (selected !== null && (isSelected || isCorrect)) ? 'inherit' : '#3b82f6' }}>{['A', 'B', 'C', 'D'][i]}.</span>{opt}
                    {selected !== null && isCorrect && ' ✅'}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {selected !== null && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass" style={{ borderRadius: 14, padding: '16px 20px', marginBottom: 16, borderLeft: '3px solid #3b82f6', background: 'rgba(59,130,246,0.05)' }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: '#3b82f6' }}>💡 Explanation</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.75 }}>{quiz[current].explanation}</div>
            </motion.div>
          )}

          {selected !== null && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} style={{
              width: '100%', padding: 14, background: '#fff', color: '#000',
              border: 'none', borderRadius: 14, color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            }}>
              {current + 1 >= quiz.length ? '🏆 See Results' : 'Next Question →'}
            </motion.button>
          )}
        </motion.div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ borderRadius: 24, padding: '48px 32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} style={{ fontSize: 64, marginBottom: 16 }}>{score / quiz.length >= 0.8 ? 'ðŸ†' : score / quiz.length >= 0.5 ? 'ðŸŽ¯' : 'ðŸ“š'}</motion.div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Quiz Complete!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Your score on <strong>{topic}</strong></p>
          <div style={{ fontSize: 60, fontWeight: 900, background: '#fff', color: '#000', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
            {score}/{quiz.length}
          </div>
          <div style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 32 }}>{Math.round((score / quiz.length) * 100)}% accuracy</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setQuiz([]); setTopic('') }} style={{
              padding: '12px 28px', background: '#fff', color: '#000',
              border: 'none', borderRadius: 14, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 15,
            }}>New Quiz</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false) }} style={{
              padding: '12px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, color: '#fff', cursor: 'pointer', fontSize: 15,
            }}>Retry</motion.button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

