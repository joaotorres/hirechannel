import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

type Question = {
  id: number
  text: string
  prompt: string
  order: number
  active: boolean
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({})
  const [saving, setSaving] = useState(false)
  const location = useLocation()

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/questions`)
      if (!res.ok) throw new Error('Failed to load questions')
      const data = await res.json()
      setQuestions(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (question: Question) => {
    setEditingId(question.id)
    setEditingQuestion({ text: question.text, prompt: question.prompt, order: question.order })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingQuestion({})
  }

  const saveQuestion = async () => {
    if (!editingId || !editingQuestion.text || !editingQuestion.prompt) return

    setSaving(true)
    try {
      const res = await fetch(`${apiUrl}/api/questions/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: editingQuestion })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.errors?.join(', ') || 'Failed to update question')
      }
      
      await loadQuestions()
      cancelEditing()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteQuestion = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this question?')) return

    try {
      const res = await fetch(`${apiUrl}/api/questions/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to deactivate question')
      
      await loadQuestions()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createQuestion = async () => {
    const newQuestion = {
      text: 'New Question',
      prompt: 'Evaluate this response for quality, relevance, structure, and clarity. Return only an integer score between 1 and 5.',
      order: questions.length + 1
    }

    setSaving(true)
    try {
      const res = await fetch(`${apiUrl}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.errors?.join(', ') || 'Failed to create question')
      }
      
      await loadQuestions()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>📝 Manage Interview Questions</h1>
            <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>
              Customize questions and their AI evaluation prompts
            </p>
          </div>
          <button 
            onClick={createQuestion} 
            disabled={saving}
            className="secondary"
            style={{ fontSize: '1rem', padding: '12px 24px' }}
          >
            ➕ Add Question
          </button>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            Loading questions...
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {!loading && !error && questions.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#666',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>No questions yet</h3>
            <p style={{ margin: 0 }}>Create your first interview question to get started.</p>
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.map((question) => (
              <div 
                key={question.id} 
                style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '1.5rem',
                  background: editingId === question.id ? '#f8fafc' : 'white'
                }}
              >
                {editingId === question.id ? (
                  // Edit mode
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                        Question Text:
                      </label>
                      <textarea
                        value={editingQuestion.text || ''}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Enter the interview question..."
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                        AI Evaluation Prompt:
                      </label>
                      <textarea
                        value={editingQuestion.prompt || ''}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, prompt: e.target.value })}
                        style={{
                          width: '100%',
                          minHeight: '120px',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Enter the AI evaluation prompt..."
                      />
                      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                        This prompt will be used by AI to evaluate candidate responses. Include specific criteria and end with "Return only an integer score between 1 and 5."
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={cancelEditing}
                        className="secondary"
                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={saveQuestion}
                        disabled={saving || !editingQuestion.text || !editingQuestion.prompt}
                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
                          #{question.order} - {question.text}
                        </h3>
                        <div style={{ 
                          background: '#f7fafc', 
                          padding: '1rem', 
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#4a5568' }}>
                            AI Evaluation Prompt:
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#2d3748', lineHeight: '1.5' }}>
                            {question.prompt}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                        <button 
                          onClick={() => startEditing(question)}
                          className="secondary"
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => deleteQuestion(question.id)}
                          className="danger"
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
