'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getToken, logout } from '@/lib/auth'

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.round(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [metrics, setMetrics] = useState({ quizzes: 0, scorePercent: 0, questions: 0 })
  const router = useRouter()

  const quizzesAnimated   = useCountUp(isMounted ? metrics.quizzes       : 0)
  const questionsAnimated = useCountUp(isMounted ? metrics.questions      : 0)
  const scoreAnimated     = useCountUp(isMounted ? metrics.scorePercent   : 0)
  const timeAnimated      = useCountUp(isMounted ? metrics.quizzes * 6    : 0)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    setIsMounted(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/progress/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => { if (!res.ok) { if (res.status === 401) logout(); throw new Error('') } return res.json() })
    .then(data => {
      const scorePercent = data.questions_answered > 0 ? Math.round((data.total_score / data.questions_answered) * 100) : 0
      setMetrics({ quizzes: data.quizzes_taken, scorePercent, questions: data.questions_answered })
    })
    .catch(console.error)
  }, [router])

  const stats = [
    { label: 'Quizzes Taken',      value: `${quizzesAnimated}`,    sym: '<' },
    { label: 'Questions Answered', value: `${questionsAnimated}`,  sym: '%' },
    { label: 'Avg Quiz Score',     value: `${scoreAnimated}%`,     sym: '*' },
    { label: 'Time Studied',       value: `${(timeAnimated/60).toFixed(1)}h`, sym: '#' },
  ]

  const quickActions = [
    { href: '/chat',       icon: '◈', label: 'Start AI Chat',     desc: 'Ask anything, get step-by-step explanations' },
    { href: '/flashcards', icon: '◇', label: 'Review Flashcards', desc: 'Continue your spaced repetition session' },
    { href: '/documents',  icon: '◻', label: 'Upload Document',   desc: 'Chat with your PDFs and notes' },
    { href: '/quiz',       icon: '◉', label: 'Take a Quiz',       desc: 'Test your knowledge and track progress' },
  ]

  const sectionHead: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(18px,2.5vw,26px)',
    letterSpacing: '-0.04em',
    color: '#fff', marginBottom: 18,
  }

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div className="anim-slide-down" style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,48px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1.05, color:'#fff', marginBottom:10 }}>
          Good evening, Student
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:15 }}>Here's your learning summary based on your actual activity.</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:44 }}>
        {stats.map((stat, i) => (
          <div key={stat.label} className="glass glass-hover stat-card" style={{ borderRadius:20, padding:'24px 26px' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:28, color:'rgba(255,255,255,0.28)', marginBottom:12 }}>{stat.sym}</div>
            <div className="anim-scale-in" style={{ fontSize:34, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', marginBottom:5, animationDelay:`${0.2 + i * 0.08}s` }}>
              {stat.value}
            </div>
            <div style={{ color:'var(--text-muted)', fontSize:13 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick start */}
      <h2 className="anim-slide-up delay-2" style={sectionHead}>Quick Start</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:16, marginBottom:44 }}>
        {quickActions.map(action => (
          <Link key={action.href} href={action.href} style={{ textDecoration:'none' }}>
            <div className="glass glass-hover action-card" style={{ borderRadius:20, padding:'24px 26px', cursor:'pointer', height:'100%' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:30, color:'rgba(255,255,255,0.55)', marginBottom:16 }}>{action.icon}</div>
              <div style={{ fontWeight:700, fontSize:15, color:'#fff', marginBottom:7 }}>{action.label}</div>
              <div style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.65 }}>{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Activity */}
      <h2 className="anim-slide-up delay-3" style={sectionHead}>Weekly Activity</h2>
      <div className="glass anim-slide-up delay-4" style={{ borderRadius:20, padding:'24px 26px', marginBottom:28 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {Array.from({ length: 35 }, (_, i) => {
            const isActive = isMounted && (34 - i) < metrics.quizzes;
            return (
              <div key={i} className={isActive ? 'anim-scale-in' : ''} style={{ width:20, height:20, borderRadius:6, background: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.05)', transition:'background 0.3s, box-shadow 0.3s', boxShadow: isActive ? '0 0 8px rgba(255,255,255,0.4)' : 'none' }} title={isActive ? 'Activity logged' : 'No activity'} />
            )
          })}
        </div>
        <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:16 }}>Last 5 weeks of study activity</div>
      </div>

      {/* Tip */}
      <div className="glass glass-hover anim-slide-up delay-5 anim-border-pulse" style={{ borderRadius:20, padding:'20px 24px', display:'flex', alignItems:'flex-start', gap:14 }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:24, color:'rgba(255,255,255,0.45)', flexShrink:0, animation:'floatY 4s ease-in-out infinite' }}>*</span>
        <div>
          <div style={{ fontWeight:600, color:'#fff', marginBottom:5, fontSize:14 }}>Today's Tip</div>
          <div style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7 }}>Upload your lecture notes to get AI-powered summaries and auto-generated flashcards. Upload a PDF to get started!</div>
        </div>
      </div>

    </div>
  )
}
