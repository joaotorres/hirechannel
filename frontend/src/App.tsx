import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

type Question = { id: number; text: string; prompt: string; order: number; active: boolean }

const RECORDING_DURATION_SECONDS = 60

function App() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(RECORDING_DURATION_SECONDS)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(true)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const stopButtonRef = useRef<HTMLButtonElement | null>(null)

  const location = useLocation()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  // Load questions from backend
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/questions`)
        if (!res.ok) throw new Error('Failed to load questions')
        const data = await res.json()
        setQuestions(data)
      } catch (e: any) {
        setError('Failed to load interview questions. Please try refreshing the page.')
      } finally {
        setLoadingQuestions(false)
      }
    }
    loadQuestions()
  }, [apiUrl])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Connect stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [stream])

  const requestPermissions = async () => {
    setError(null)
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(media)
    } catch (e: any) {
      setError('Camera/Microphone permission denied or unavailable.')
    }
  }

  const startRecording = async () => {
    if (!stream) {
      await requestPermissions()
    }
    if (!stream) return

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' })
      chunksRef.current = []
      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorder.onstop = () => {
        void handleUpload()
      }
      mediaRecorder.start()
      setRecorder(mediaRecorder)
      setRecording(true)
      setTimeLeft(RECORDING_DURATION_SECONDS)
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Clear the interval immediately to prevent multiple calls
            if (timerRef.current) {
              window.clearInterval(timerRef.current)
              timerRef.current = null
            }
            // Programmatically click the stop button
            if (stopButtonRef.current) {
              stopButtonRef.current.click()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (e: any) {
      setError('Failed to start recording. Your browser may not support MediaRecorder.')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
    setRecording(false)
  }

  const handleUpload = async () => {
    setUploading(true)
    setError(null)
    
    const blob = new Blob(chunksRef.current, { type: 'video/webm' })
    const file = new File([blob], 'answer.webm', { type: 'video/webm' })

    const form = new FormData()
    form.append('video', file)
    form.append('questionId', currentQuestion.id.toString())

    try {
      const resp = await fetch(`${apiUrl}/api/answers`, {
        method: 'POST',
        body: form,
      })
      if (!resp.ok) throw new Error('Upload failed')
      // Advance to next question automatically
      setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))
      setTimeLeft(RECORDING_DURATION_SECONDS)
    } catch (e: any) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Get current question
  const currentQuestion = questions[currentIndex] || { id: 0, text: 'Loading...', prompt: '', order: 0, active: true }

  // Show loading state while questions are being loaded
  if (loadingQuestions) {
    return (
      <div className="card" style={{ maxWidth: 800, margin: '3rem auto', textAlign: 'center' }}>
        <div className="loading">
          <div className="spinner"></div>
          Loading interview questions...
        </div>
      </div>
    )
  }

  // Show error if questions failed to load
  if (questions.length === 0) {
    return (
      <div className="card" style={{ maxWidth: 800, margin: '3rem auto', textAlign: 'center' }}>
        <h1>⚠️ No Interview Questions Available</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          No interview questions have been configured yet. Please contact your administrator to set up the interview questions.
        </p>
        <Link to="/questions">
          <button className="secondary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
            📝 Manage Questions
          </button>
        </Link>
      </div>
    )
  }

  // Initial screen until camera/mic is enabled
  if (!stream) {
    return (
      <div className="card" style={{ maxWidth: 800, margin: '3rem auto', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>🎥 Hirechannel Video Interview</h1>
          <p style={{ fontSize: '1.2rem', color: '#667eea', fontWeight: '600', marginBottom: '0.5rem' }}>
            AI-Powered One-Way Interview Platform
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
          padding: '2rem', 
          borderRadius: '16px', 
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>How it works:</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ 
                background: '#667eea', 
                color: 'white', 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                1
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>Record Answers</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568' }}>
                  Answer {questions.length} interview questions with 60-second video recordings
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ 
                background: '#667eea', 
                color: 'white', 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                2
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>AI Analysis</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568' }}>
                  Our AI transcribes and evaluates your responses
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ 
                background: '#667eea', 
                color: 'white', 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                3
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>Get Results</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568' }}>
                  Receive scores (1-5) and transcripts for each answer
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: '#f0fff4', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          border: '1px solid #9ae6b4'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <h4 style={{ margin: 0, color: '#22543d' }}>Privacy & Security</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#22543d' }}>
            Your video recordings are processed securely and are not stored permanently. 
            Only transcripts and scores are retained for evaluation purposes.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.1rem', color: '#4a5568', marginBottom: '1rem' }}>
            Ready to start your interview? Please enable your camera and microphone to continue.
          </p>
          <button 
            onClick={requestPermissions} 
            style={{ 
              fontSize: '1.2rem', 
              padding: '18px 36px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}
          >
            🎤 Start My Interview
          </button>
        </div>

        {error && <div className="error">{error}</div>}
      </div>
    )
  }

  // Recording UI after permissions granted
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

      <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>Video Interview</h1>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <div style={{ 
          background: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '1.3rem', 
            fontWeight: '600', 
            color: '#2d3748', 
            lineHeight: '1.5',
            textAlign: 'center'
          }}>
            {currentQuestion.text}
          </p>
        </div>

        <video 
          ref={videoRef} 
          playsInline 
          muted 
          style={{ 
            width: '100%', 
            background: '#000', 
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }} 
        />

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {!recording ? (
            <button 
              onClick={startRecording} 
              disabled={uploading}
              style={{ fontSize: '1.1rem', padding: '16px 32px' }}
            >
              {uploading ? '⏳ Uploading...' : '▶️ Start Recording'}
            </button>
          ) : (
            <button 
              ref={stopButtonRef} 
              onClick={stopRecording} 
              className="danger"
              style={{ fontSize: '1.1rem', padding: '16px 32px' }}
            >
              ⏹️ Stop Recording
            </button>
          )}
          
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: '600',
            color: recording ? '#e53e3e' : '#4a5568',
            fontVariantNumeric: 'tabular-nums'
          }}>
            ⏱️ {timeLeft}s remaining
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        
        {uploading && (
          <div className="loading">
            <div className="spinner"></div>
            Uploading your answer...
          </div>
        )}
      </div>
    </>
  )
}

export default App
