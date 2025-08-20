import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

type Answer = {
  id: number
  question_id: string
  status: string
  score: number | null
  transcript: string | null
  created_at: string
}

export default function AnswersPage() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const load = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const res = await fetch(`${apiUrl}/api/answers`)
        if (!res.ok) throw new Error('Failed to load answers')
        const data = await res.json()
        setAnswers(data)
      } catch (e: any) {
        setError(e.message || 'Failed to load answers')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const getStatusBadge = (status: string) => {
    return <span className={`status ${status}`}>{status}</span>
  }

  const getScoreDisplay = (score: number | null) => {
    if (score === null) return '-'
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontWeight: '600',
        color: score >= 4 ? '#38a169' : score >= 3 ? '#d69e2e' : '#e53e3e'
      }}>
        <span style={{ fontSize: '1.2rem' }}>
          {score === 5 ? '⭐⭐⭐⭐⭐' : 
           score === 4 ? '⭐⭐⭐⭐' : 
           score === 3 ? '⭐⭐⭐' : 
           score === 2 ? '⭐⭐' : '⭐'}
        </span>
        {score}/5
      </div>
    )
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-content">
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🎥 Hirechannel</h2>
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Record Interview
            </Link>
            <Link to="/answers" className={location.pathname === '/answers' ? 'active' : ''}>
              View Answers
            </Link>
            <Link to="/questions" className={location.pathname === '/questions' ? 'active' : ''}>
              Manage Questions
            </Link>
          </div>
        </div>
      </nav>

      <div className="card" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>📋 Submitted Answers</h1>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>
            All recorded answers with AI analysis and scoring
          </p>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            Loading answers...
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {!loading && !error && answers.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#666',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>No answers yet</h3>
            <p style={{ margin: 0 }}>Start recording your interview answers to see them here.</p>
            <Link to="/" style={{ display: 'inline-block', marginTop: '1rem' }}>
              <button className="secondary">Start Recording</button>
            </Link>
          </div>
        )}

        {!loading && !error && answers.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Submitted</th>
                  <th>Question</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Transcript</th>
                </tr>
              </thead>
              <tbody>
                {answers.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: '600', color: '#667eea' }}>#{a.id}</td>
                    <td>{new Date(a.created_at).toLocaleString()}</td>
                    <td style={{ fontWeight: '500' }}>{a.question_id}</td>
                    <td>{getStatusBadge(a.status)}</td>
                    <td>{getScoreDisplay(a.score)}</td>
                    <td style={{ 
                      maxWidth: 300, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      color: a.transcript ? '#2d3748' : '#a0aec0'
                    }} 
                    title={a.transcript || 'No transcript available'}>
                      {a.transcript || 'Processing...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}


