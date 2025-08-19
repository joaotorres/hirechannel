import { useEffect, useState } from 'react'

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

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 8 }}>Submitted Answers</h1>
      <p style={{ color: '#555', marginTop: 0 }}>
        Listing all answers with submission time, question id, transcript and score.
      </p>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: '#c0392b' }}>{error}</div>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Submitted</th>
              <th style={th}>Question</th>
              <th style={th}>Status</th>
              <th style={th}>Score</th>
              <th style={th}>Transcript</th>
            </tr>
          </thead>
          <tbody>
            {answers.map(a => (
              <tr key={a.id}>
                <td style={td}>{a.id}</td>
                <td style={td}>{new Date(a.created_at).toLocaleString()}</td>
                <td style={td}>{a.question_id}</td>
                <td style={td}>{a.status}</td>
                <td style={td}>{a.score ?? '-'}</td>
                <td style={{ ...td, maxWidth: 380, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.transcript || ''}>
                  {a.transcript || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )}

const th: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  padding: '8px 6px',
}

const td: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '8px 6px',
  verticalAlign: 'top',
}


