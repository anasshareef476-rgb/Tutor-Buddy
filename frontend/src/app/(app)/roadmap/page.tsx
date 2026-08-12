'use client'
import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'

interface RoadmapWeek { week: number; topics: string[]; completed: boolean[] }

export default function RoadmapPage() {
  const [goal, setGoal] = useState('')
  const [weeks, setWeeks] = useState(4)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([])
  const [title, setTitle] = useState('')

  const generateRoadmap = async () => {
    if (!goal.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/ai/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, weeks }),
      })
      const data = await res.json()
      if (!res.ok || !data.weeks) throw new Error(data.detail || 'Failed to generate roadmap. Please try again.')
      setTitle(data.title || goal)
      setRoadmap(data.weeks.map((w: any) => ({ ...w, completed: w.topics.map(() => false) })))
    } catch (e: any) {
      setError(e.message || 'AI error. Please try again.')
    } finally { setLoading(false) }
  }

  const toggleTopic = (wi: number, ti: number) => {
    setRoadmap(prev => prev.map((w, i) => i !== wi ? w : {
      ...w, completed: w.completed.map((c, j) => j === ti ? !c : c)
    }))
  }

  const totalTopics = roadmap.reduce((s, w) => s + w.topics.length, 0)
  const doneTopics = roadmap.reduce((s, w) => s + w.completed.filter(Boolean).length, 0)
  const pct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }} className="fade-in">
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>ðŸ—ºï¸ AI Learning Roadmap</h1>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>🗺️ AI Learning Roadmap</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>Generate a personalized weekly study plan for any subject or goal.</p>

      {roadmap.length === 0 && !loading && (
        <div className="glass" style={{ borderRadius: 20, padding: '32px 28px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-muted)' }}>What do you want to master?</label>
            <input value={goal} onChange={e => setGoal(e.target.value)} onKeyDown={e => e.key === 'Enter' && generateRoadmap()} placeholder="e.g. Data Structures & Algorithms, Machine Learning, Spanish..." style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '13px 16px', color: '#fff', fontSize: 15, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-muted)' }}>Duration: <span style={{ color: '#6c63ff' }}>{weeks} weeks</span></label>
            <input type="range" min={2} max={12} value={weeks} onChange={e => setWeeks(Number(e.target.value))} style={{ width: '100%', accentColor: '#6c63ff' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}><span>2 weeks</span><span>12 weeks</span></div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {['DSA for Interviews', 'Machine Learning Basics', 'Web Development', 'React.js', 'Linear Algebra'].map(g => (
              <button key={g} onClick={() => setGoal(g)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '7px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>{g}</button>
            ))}
          </div>
          <button onClick={generateRoadmap} disabled={!goal.trim()} style={{
            width: '100%', padding: 15, background: '#fff',
            border: 'none', borderRadius: 14, color: 'white', fontWeight: 700, fontSize: 16,
            cursor: goal.trim() ? 'pointer' : 'not-allowed',
          }}>✨ Generate My Roadmap</button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div className="spinner" style={{ margin: '0 auto 20px', width: 40, height: 40 }} />
          <p style={{ color: 'var(--text-muted)' }}>Building your {weeks}-week roadmap for "<strong>{goal}</strong>"...</p>
        </div>
      )}

      {roadmap.length > 0 && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h2>
            <button onClick={() => { setRoadmap([]); setTitle('') }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>↺ Regenerate</button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              <span>{doneTopics} / {totalTopics} topics completed</span>
              <span style={{ color: '#6c63ff', fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#fff', borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {roadmap.map((week, wi) => {
              const weekComplete = week.completed.every(Boolean)
              return (
                <div key={wi} className="glass" style={{ borderRadius: 16, padding: '20px 20px', borderLeft: `3px solid ${weekComplete ? '#22c55e' : '#6c63ff'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: weekComplete ? '#22c55e' : 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {weekComplete ? '✓' : week.week}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Week {week.week}</span>
                    {weekComplete && <span style={{ fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '3px 10px', borderRadius: 20 }}>Complete ✓</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 46 }}>
                    {week.topics.map((topic, ti) => (
                      <label key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                        <input type="checkbox" checked={week.completed[ti]} onChange={() => toggleTopic(wi, ti)} style={{ accentColor: '#6c63ff', width: 16, height: 16, marginTop: 1, cursor: 'pointer', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, lineHeight: 1.5, color: week.completed[ti] ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: week.completed[ti] ? 'line-through' : 'none', transition: 'color 0.2s' }}>{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

