'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, logout } from '@/lib/auth'

export default function ProgressPage() {
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

  const subjects = [
    { name: 'General Knowledge', progress: isMounted ? metrics.scorePercent : 0, color: 'var(--accent)' },
    { name: 'Mathematics', progress: 0, color: '#22c55e' },
    { name: 'Physics', progress: 0, color: '#f59e0b' },
    { name: 'Biology', progress: 0, color: '#06b6d4' },
  ]
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  // Simple fake chart logic using actual quizzes as a seed
  const weekData = Array.from({ length: 7 }, (_, i) => isMounted ? (i < (metrics.quizzes % 7 + 1) ? metrics.quizzes * 5 : 0) : 0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="fade-in">
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>ðŸ“Š Learning Progress</h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Cards Reviewed', value: isMounted ? '0' : '-', icon: '🗂️' },
          { label: 'Quizzes Taken', value: isMounted ? metrics.quizzes.toString() : '-', icon: '📝' },
          { label: 'Avg Quiz Score', value: isMounted ? `${metrics.scorePercent}%` : '-', icon: '🎯' },
          { label: 'Study Streak', value: isMounted ? '0 days' : '-', icon: '🔥' },
          { label: 'Total Study Time', value: isMounted ? `${(metrics.quizzes * 0.1).toFixed(1)}h` : '-', icon: '⏱️' },
          { label: 'Questions Answered', value: isMounted ? metrics.questions.toString() : '-', icon: '🧠' },
        ].map(s => (
          <div key={s.label} className="glass glass-hover" style={{ borderRadius: 14, padding: '18px 16px' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subject progress */}
      <div className="glass" style={{ borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Subject Mastery</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {subjects.map(s => (
            <div key={s.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                <span style={{ fontWeight: 500 }}>{s.name}</span>
                <span style={{ color: s.color, fontWeight: 700 }}>{s.progress}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${s.progress}%`, background: s.color, borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly activity bar chart */}
      <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>Weekly Activity (minutes)</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
          {weekData.map((val, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{val}m</div>
              <div style={{ width: '100%', height: `${Math.min(100, (val / 100) * 100)}%`, background: 'var(--gradient-1)', borderRadius: '6px 6px 0 0', opacity: 0.85, transition: 'height 0.5s' }} />
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{weekDays[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

