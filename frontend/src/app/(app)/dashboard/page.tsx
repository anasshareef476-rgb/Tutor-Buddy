'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getToken, logout } from '@/lib/auth'

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [metrics, setMetrics] = useState({ quizzes: 0, scorePercent: 0, questions: 0 })

  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    setIsMounted(true)
    fetch('http://localhost:8001/api/v1/progress/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) logout()
        throw new Error('Failed to fetch progress')
      }
      return res.json()
    })
    .then(data => {
      const scorePercent = data.questions_answered > 0 ? Math.round((data.total_score / data.questions_answered) * 100) : 0
      setMetrics({ quizzes: data.quizzes_taken, scorePercent, questions: data.questions_answered })
    })
    .catch(console.error)
  }, [router])

  const stats = [
    { label: 'Quizzes Taken', value: isMounted ? metrics.quizzes.toString() : '-', icon: '🔥', gradient: 'var(--gradient-3)' },
    { label: 'Questions Answered', value: isMounted ? metrics.questions.toString() : '-', icon: '🃏', gradient: 'var(--gradient-1)' },
    { label: 'Avg Quiz Score', value: isMounted ? `${metrics.scorePercent}%` : '-', icon: '📝', gradient: 'var(--gradient-2)' },
    { label: 'Time Studied', value: isMounted ? (metrics.quizzes * 0.1).toFixed(1) + 'h' : '-', icon: '⏱️', gradient: 'var(--gradient-1)' },
  ]

  const quickActions = [
    { href: '/chat', icon: '💬', label: 'Start AI Chat', desc: 'Ask anything, get step-by-step explanations' },
    { href: '/flashcards', icon: '🃏', label: 'Review Flashcards', desc: 'Continue your spaced repetition session' },
    { href: '/documents', icon: '📄', label: 'Upload Document', desc: 'Chat with your PDFs and notes' },
    { href: '/quiz', icon: '📝', label: 'Take a Quiz', desc: 'Test your knowledge and track progress' },
  ]

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Good evening, Student! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Here's your learning summary based on your actual activity.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(stat => (
          <div key={stat.label} className="glass glass-hover" style={{ borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, background: stat.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {stat.value}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Start</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {quickActions.map(action => (
          <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
            <div className="glass glass-hover" style={{ borderRadius: 16, padding: 20, cursor: 'pointer', height: '100%' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{action.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{action.label}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Activity Heatmap placeholder */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Weekly Activity</h2>
      <div className="glass" style={{ borderRadius: 16, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: 35 }, (_, i) => {
            const isActive = isMounted && i % 7 === 0 && i < metrics.quizzes * 5
            const bg = isActive ? 'var(--accent)' : 'var(--bg-card-hover)'
            return <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: bg, transition: 'transform 0.1s' }} />
          })}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>Last 5 weeks of study activity</div>
      </div>

      {/* Tips */}
      <div className="glass" style={{ borderRadius: 16, padding: 20, border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Today's Tip</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Upload your lecture notes to get AI-powered summaries and auto-generated flashcards. Upload a PDF to get started!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
