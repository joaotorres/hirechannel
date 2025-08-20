import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

type Question = {
  id: number
  text: string
  prompt: string
  order: number
  active: boolean
}

type JobDescription = {
  id: number
  title: string
  description: string
  active: boolean
  created_at: string
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({})
  const [editingJobDescription, setEditingJobDescription] = useState<Partial<JobDescription>>({})
  const [saving, setSaving] = useState(false)
  const location = useLocation()

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    loadQuestions()
    loadJobDescription()
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

  const loadJobDescription = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/job_descriptions/current`)
      if (res.ok) {
        const data = await res.json()
        setJobDescription(data)
      }
    } catch (e: any) {
      console.error('Failed to load job description:', e)
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

  const saveJobDescription = async () => {
    if (!editingJobDescription.title || !editingJobDescription.description) return

    setSaving(true)
    try {
      const res = await fetch(`${apiUrl}/api/job_descriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: editingJobDescription })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.errors?.join(', ') || 'Failed to update job description')
      }
      
      await loadJobDescription()
      setEditingJobDescription({})
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
              Customize questions, their AI evaluation prompts, and job description
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

        {/* Job Description Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)', 
          padding: '2rem', 
          borderRadius: '16px', 
          marginBottom: '2rem',
          border: '1px solid #9ae6b4'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: '#22543d' }}>💼 Job Description</h2>
          <p style={{ color: '#22543d', marginBottom: '1.5rem' }}>
            This job description will be included in all AI evaluations to provide context for scoring candidate responses.
          </p>

          {!jobDescription && !editingJobDescription.title && !editingJobDescription.description ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#22543d', marginBottom: '1rem' }}>
                No job description configured yet. Create one to provide context for AI evaluations.
              </p>
              <button 
                onClick={() => setEditingJobDescription({ title: '', description: '' })}
                className="secondary"
                style={{ fontSize: '0.9rem', padding: '8px 16px' }}
              >
                ➕ Create Job Description
              </button>
            </div>
          ) : editingJobDescription.title !== undefined || editingJobDescription.description !== undefined ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#22543d' }}>
                  Job Title:
                </label>
                <input
                  type="text"
                  value={editingJobDescription.title || ''}
                  onChange={(e) => setEditingJobDescription({ ...editingJobDescription, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #9ae6b4',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="e.g., Software Engineer, Marketing Manager..."
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#22543d' }}>
                  Job Description:
                </label>
                <textarea
                  value={editingJobDescription.description || ''}
                  onChange={(e) => setEditingJobDescription({ ...editingJobDescription, description: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '0.75rem',
                    border: '1px solid #9ae6b4',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Describe the job position, responsibilities, requirements, and company culture..."
                />
                <p style={{ fontSize: '0.875rem', color: '#22543d', marginTop: '0.5rem' }}>
                  This description will be provided to the AI evaluator for context when scoring all interview responses.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setEditingJobDescription({})}
                  className="secondary"
                  style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={saveJobDescription}
                  disabled={saving || !editingJobDescription.title || !editingJobDescription.description}
                  style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  {saving ? 'Saving...' : 'Save Job Description'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #9ae6b4', 
              borderRadius: '12px', 
              padding: '1.5rem',
              background: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#22543d' }}>
                    {jobDescription?.title}
                  </h3>
                  <div style={{ 
                    background: '#f0fff4', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: '1px solid #9ae6b4'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#22543d' }}>
                      Job Description:
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#22543d', lineHeight: '1.5' }}>
                      {jobDescription?.description}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button 
                    onClick={() => setEditingJobDescription({ 
                      title: jobDescription?.title || '', 
                      description: jobDescription?.description || '' 
                    })}
                    className="secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div>
          <h2 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>❓ Interview Questions</h2>
          
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
                          This prompt will be combined with the job description and used by AI to evaluate candidate responses. Include specific criteria and end with "Return only an integer score between 1 and 5."
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
      </div>
    </>
  )
}
