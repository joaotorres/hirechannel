import { useEffect, useRef, useState } from 'react'
import './App.css'

type Question = { id: string; text: string }

const RECORDING_DURATION_SECONDS = 60

const QUESTIONS: Question[] = [
  { id: 'q1', text: 'Tell us about yourself' },
  { id: 'q2', text: "What’s your greatest achievement?" },
  { id: 'q3', text: 'Where do you see yourself in 5 years?' },
  { id: 'q4', text: 'Why do you want to work with us?' },
  { id: 'q5', text: 'How do you handle working under pressure?' },
]

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(RECORDING_DURATION_SECONDS)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const stopButtonRef = useRef<HTMLButtonElement | null>(null)

  const question = QUESTIONS[currentIndex]

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
    const blob = new Blob(chunksRef.current, { type: 'video/webm' })
    const file = new File([blob], 'answer.webm', { type: 'video/webm' })

    const form = new FormData()
    form.append('video', file)
    form.append('questionId', question.id)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const resp = await fetch(`${apiUrl}/api/answers`, {
        method: 'POST',
        body: form,
      })
      if (!resp.ok) throw new Error('Upload failed')
      // Advance to next question automatically
      setCurrentIndex(prev => Math.min(prev + 1, QUESTIONS.length - 1))
      setTimeLeft(RECORDING_DURATION_SECONDS)
    } catch (e: any) {
      setError('Upload failed. Please try again.')
    }
  }

  // Initial screen until camera/mic is enabled
  if (!stream) {
    return (
      <div style={{ maxWidth: 720, margin: '3rem auto', fontFamily: 'Inter, system-ui, Arial', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>Hirechannel: One-way Interviews</h1>
        <p style={{ color: '#555', margin: '1rem 0 2rem' }}>
          Welcome to Hirechannel, this is a system for one-way inteviews based on AI. You'll record video answers for 5 questions that will be analysed by AI and graded with a score of 1 to 5. Please enable your Camera & Mic to continue.
        </p>
        <button onClick={requestPermissions}>Enable Camera & Mic</button>
        {error && <div style={{ marginTop: 12, color: '#c0392b' }}>{error}</div>}
      </div>
    )
  }

  // Recording UI after permissions granted
  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 8 }}>Video Interview</h1>
      <p style={{ color: '#555', marginTop: 0 }}>Question {currentIndex + 1} of {QUESTIONS.length}</p>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#333', lineHeight: 1.4 }}>{question.text}</p>
      </div>
      <video ref={videoRef} playsInline muted style={{ width: '100%', background: '#000', borderRadius: 8 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <button onClick={requestPermissions} disabled={!!stream}>
          {stream ? 'Ready' : 'Enable Camera & Mic'}
        </button>
        {!recording ? (
          <button onClick={startRecording}>Start</button>
        ) : (
          <button ref={stopButtonRef} onClick={stopRecording} style={{ background: '#c0392b', color: 'white' }}>Stop</button>
        )}
        <div style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
          Time left: {timeLeft}s
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: '#c0392b' }}>{error}</div>
      )}
    </div>
  )
}

export default App
