import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Clock3, Mic, MicOff, Send, X, Volume2, AlertCircle, CheckCircle2, Video, VideoOff } from 'lucide-react'
import { startInterview, submitAnswer, endInterview, runDSACode, submitDSASolution } from '../services/interview'

export default function InterviewRoomFullScreen() {
  const user = JSON.parse(localStorage.getItem('hiresense_user') || 'null')
  const isRecruiter = user?.role === 'recruiter'
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [interviewId, setInterviewId] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(900) // 15 minutes in seconds
  const [questionNumber, setQuestionNumber] = useState(1)
  const [totalScore, setTotalScore] = useState(0)
  const [consecutiveWrong, setConsecutiveWrong] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [endReason, setEndReason] = useState('')
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [interviewType, setInterviewType] = useState('ai') // 'ai', 'dsa', 'aptitude'
  const [showTypeSelector, setShowTypeSelector] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeContextCount, setResumeContextCount] = useState(0)
  const [dsaQuestions, setDsaQuestions] = useState([])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [dsaCodes, setDsaCodes] = useState({}) // q_id -> user_code
  const [dsaFeedbacks, setDsaFeedbacks] = useState({}) // q_id -> {score, feedback, is_correct, test_cases}
  const [dsaRunning, setDsaRunning] = useState(false)
  const [dsaSubmitting, setDsaSubmitting] = useState(false)
  
  const recognitionRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (isRecruiter) {
      window.location.href = '/admin'
    }
  }, [isRecruiter])

  const requestInterviewFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (err) {
      console.log('Fullscreen request failed:', err)
    }
  }

  // Track fullscreen state without forcing it before a user action.
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !interviewEnded && interviewId && !isSubmitting) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeRemaining <= 0 && interviewId) {
      handleEndInterview('Time limit reached')
    }
  }, [timeRemaining, interviewId, interviewEnded, isSubmitting])

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)
        if (finalTranscript) {
          setAnswer(prev => prev + ' ' + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        if (isRecording) {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isRecording])

  const startInterviewSession = async (type) => {
    if (isStarting) return
    await requestInterviewFullscreen()
    setInterviewType(type)
    setShowTypeSelector(false)
    setIsStarting(true)
    const resumeContext = JSON.parse(localStorage.getItem('hiresense_resume_context') || '{}')
    setResumeContextCount((resumeContext.skills || []).length)
    
    try {
      const response = await startInterview({
        user_id: user.id,
        skills: resumeContext.skills || [],
        projects: resumeContext.projects || [],
        jd_text: resumeContext.jd_text || '',
        company_name: resumeContext.company_name || null,
        interview_type: type
      })
      
      setInterviewId(response.interview_id)
      if (type === 'dsa') {
        setDsaQuestions(response.dsa_questions || [])
        setActiveQuestionIndex(0)
        const stubs = {}
        response.dsa_questions?.forEach(q => {
          stubs[q.id] = q.code_stubs?.python || ''
        })
        setDsaCodes(stubs)
        setTimeRemaining(3600) // Exactly 1 hour (3600 seconds)
      } else {
        setCurrentQuestion(response.question)
        setTimeRemaining(response.duration_minutes * 60)
      }
    } catch (error) {
      console.error('Failed to start interview:', error)
      alert(error.response?.data?.detail || 'Failed to start interview. Please try again.')
      setShowTypeSelector(true)
    } finally {
      setIsStarting(false)
    }
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      setIsListening(false)
      // When stopping recording, ensure transcript is added to answer
      if (transcript.trim()) {
        setAnswer(prev => prev.trim() + ' ' + transcript.trim())
      }
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
      setIsListening(true)
      setTranscript('')
    }
  }

  const submitAnswerHandler = async () => {
    const trimmedAnswer = answer.trim()
    if (!trimmedAnswer || !interviewId || isSubmitting) {
      console.log('Cannot submit: answer empty or no interview ID', { answer: trimmedAnswer, interviewId })
      return
    }

    try {
      setIsSubmitting(true)
      setShowFeedback(false)
      console.log('Submitting answer:', { interviewId, questionId: currentQuestion?.id, answer: trimmedAnswer })
      const response = await submitAnswer({
        interview_id: interviewId,
        question_id: currentQuestion.id,
        answer: trimmedAnswer,
        answer_type: isRecording ? 'voice' : 'text',
        transcription: transcript
      })

      setFeedback({
        score: response.score,
        feedback: response.feedback,
        is_correct: response.is_correct
      })
      setShowFeedback(true)

      if (response.is_correct) {
        setConsecutiveWrong(0)
      } else {
        setConsecutiveWrong(prev => prev + 1)
      }

      setTotalScore(response.total_score)

      if (response.interview_ended) {
        setInterviewEnded(true)
        setEndReason(response.end_reason)
        setTimeout(() => exitFullscreen(), 3000)
      } else if (response.next_question) {
        setTimeout(() => {
          setCurrentQuestion(response.next_question)
          setQuestionNumber(prev => prev + 1)
          setAnswer('')
          setTranscript('')
          setShowFeedback(false)
          setFeedback(null)
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert(error.response?.data?.detail || 'Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEndInterview = async (reason) => {
    if (interviewId) {
      try {
        await endInterview(interviewId)
      } catch (error) {
        console.error('Failed to end interview:', error)
      }
    }
    setInterviewEnded(true)
    setEndReason(reason)
    setTimeout(() => exitFullscreen(), 3000)
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.log('Exit fullscreen failed:', err)
    }
    window.location.href = isRecruiter ? '/admin' : '/candidate-dashboard'
  }

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
      setIsCameraOn(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsCameraOn(true)
      } catch (err) {
        console.error('Camera access denied:', err)
        alert('Camera access is required for the interview')
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (showTypeSelector) {
    const candidateOptions = [
      {
        type: 'ai',
        icon: Bot,
        title: 'AI Interview',
        description: 'Questions based on your resume and skills with adaptive difficulty',
      },
      {
        type: 'dsa',
        icon: Volume2,
        title: 'DSA Practice',
        description: 'Data Structures and Algorithms coding questions',
      },
      {
        type: 'aptitude',
        icon: CheckCircle2,
        title: 'Aptitude Test',
        description: 'Quantitative and logical reasoning questions',
      },
    ]

    return (
      <div className="fullscreen-interview">
        <div className="interview-type-selector">
          <h1>Select Interview Type</h1>
          <div className="type-options">
            {candidateOptions.map((option) => {
              const Icon = option.icon
              return (
                <button className="type-card" key={option.title} onClick={() => startInterviewSession(option.type)} disabled={isStarting}>
                  <Icon size={48} />
                  <h2>{option.title}</h2>
                  <p>{option.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (interviewEnded) {
    return (
      <div className="fullscreen-interview">
        <div className="interview-ended">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="end-card"
          >
            <div className="end-icon">
              {endReason === 'Question limit reached' ? <CheckCircle2 size={64} /> : <AlertCircle size={64} />}
            </div>
            <h1>Interview {endReason === 'Question limit reached' ? 'Completed' : 'Ended'}</h1>
            <p>{endReason}</p>
            <div className="final-stats">
              <div className="stat">
                <span className="label">Total Score</span>
                <span className="value">{totalScore}%</span>
              </div>
              <div className="stat">
                <span className="label">Questions Answered</span>
                <span className="value">{questionNumber}</span>
              </div>
            </div>
            <p className="redirecting">Redirecting to dashboard...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (interviewType === 'dsa' && !showTypeSelector && dsaQuestions.length > 0) {
    const activeQ = dsaQuestions[activeQuestionIndex]
    const activeCode = dsaCodes[activeQ.id] || ''
    const activeFeedback = dsaFeedbacks[activeQ.id] || null

    const handleLanguageChange = (lang) => {
      setSelectedLanguage(lang)
      setDsaCodes(prev => ({
        ...prev,
        [activeQ.id]: activeQ.code_stubs?.[lang] || ''
      }))
    }

    const runCodeHandler = async () => {
      if (dsaRunning) return
      setDsaRunning(true)
      try {
        const response = await runDSACode({
          interview_id: interviewId,
          question_id: activeQ.id,
          language: selectedLanguage,
          code: activeCode
        })
        
        const updatedQs = [...dsaQuestions]
        updatedQs[activeQuestionIndex].test_cases = response.test_cases
        setDsaQuestions(updatedQs)
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to run test cases. Please try again.')
      } finally {
        setDsaRunning(false)
      }
    }

    const submitCodeHandler = async () => {
      if (dsaSubmitting) return
      setDsaSubmitting(true)
      try {
        const response = await submitDSASolution({
          interview_id: interviewId,
          question_id: activeQ.id,
          language: selectedLanguage,
          code: activeCode
        })
        
        setDsaFeedbacks(prev => ({
          ...prev,
          [activeQ.id]: response
        }))

        const updatedQs = [...dsaQuestions]
        updatedQs[activeQuestionIndex].status = response.is_correct ? 'passed' : 'failed'
        updatedQs[activeQuestionIndex].test_cases = response.test_cases
        setDsaQuestions(updatedQs)
        setTotalScore(response.total_score)

        if (response.interview_ended) {
          setInterviewEnded(true)
          setEndReason(response.end_reason)
          setTimeout(() => exitFullscreen(), 4000)
        }
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to submit solution. Please try again.')
      } finally {
        setDsaSubmitting(false)
      }
    }

    return (
      <div className="fullscreen-interview dsa-arena" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#090d16', color: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <header className="interview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#0e1726', borderBottom: '1px solid #1e293b' }}>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="interview-type-badge" style={{ background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 13, fontWeight: 'bold' }}>DSA Coding Arena</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {dsaQuestions.map((q, idx) => {
                const isPassed = q.status === 'passed'
                const isFailed = q.status === 'failed'
                const borderTone = idx === activeQuestionIndex ? '#3b82f6' : '#334155'
                const bgTone = idx === activeQuestionIndex ? '#1e3a8a' : isPassed ? '#065f46' : isFailed ? '#7f1d1d' : '#1e293b'
                const checkColor = isPassed ? '#34d399' : isFailed ? '#f87171' : '#9ca3af'
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIndex(idx)}
                    style={{
                      border: `1px solid ${borderTone}`,
                      background: bgTone,
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: checkColor }} />
                    Q{idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="header-center" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 'bold', color: timeRemaining < 120 ? '#ef4444' : '#fff' }}>
            <Clock3 size={20} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <div className="header-right">
            <button className="end-btn" onClick={() => handleEndInterview('User ended DSA session')} style={{ background: '#b91c1c', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
              <X size={18} />
              End Practice
            </button>
          </div>
        </header>

        {/* Main Coding Area */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel: Description */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, borderRight: '1px solid #1e293b', background: '#0b111e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="difficulty-badge" style={{ background: activeQ.difficulty === 'easy' ? '#065f46' : activeQ.difficulty === 'medium' ? '#92400e' : '#7f1d1d', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>{activeQ.difficulty}</span>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>Question {activeQuestionIndex + 1} of 5</span>
            </div>
            <h1 style={{ fontSize: 24, margin: '0 0 16px', color: '#fff' }}>{activeQ.title}</h1>
            <div style={{ color: '#d1d5db', lineHeight: '1.6', fontSize: 15, whiteSpace: 'pre-wrap' }}>
              {activeQ.problem_statement}
            </div>
          </div>

          {/* Right Panel: Editor & Output */}
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#090d16' }}>
            {/* Editor Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: '#0e1726', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: '500' }}>Select Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  style={{
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (ES6)</option>
                  <option value="cpp">C++ (GCC 17)</option>
                  <option value="java">Java (JDK 17)</option>
                </select>
              </div>
              <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 'bold' }}>Monokai Dark Theme</span>
            </div>

            {/* Code Textarea */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#0d131f' }}>
              <div style={{ width: 45, background: '#080c14', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#475569', fontFamily: 'Courier New, monospace', fontSize: 14, userSelect: 'none', borderRight: '1px solid #1e293b' }}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} style={{ height: 21 }}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={activeCode}
                onChange={(e) => setDsaCodes(prev => ({ ...prev, [activeQ.id]: e.target.value }))}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: '#a7f3d0',
                  border: 'none',
                  outline: 'none',
                  padding: '16px 12px',
                  fontFamily: 'Consolas, Monaco, Courier New, monospace',
                  fontSize: 14,
                  lineHeight: '21px',
                  resize: 'none',
                  whiteSpace: 'pre',
                  tabSize: 4
                }}
                placeholder="Type your DSA solution here..."
              />
            </div>

            {/* Toolbar Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '12px 18px', background: '#0e1726', borderTop: '1px solid #1e293b' }}>
              <button
                onClick={runCodeHandler}
                disabled={dsaRunning || dsaSubmitting}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: '1px solid #475569',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: dsaRunning || dsaSubmitting ? 0.6 : 1
                }}
              >
                <Bot size={16} />
                {dsaRunning ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={submitCodeHandler}
                disabled={dsaSubmitting || dsaRunning}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: dsaSubmitting || dsaRunning ? 0.6 : 1
                }}
              >
                <Send size={16} />
                {dsaSubmitting ? 'Evaluating...' : 'Submit Solution'}
              </button>
            </div>

            {/* Outputs & AI Reviews Panel */}
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', background: '#0b111e', borderTop: '1px solid #1e293b', overflow: 'hidden' }}>
              <div style={{ display: 'flex', background: '#0d1624', borderBottom: '1px solid #1e293b', padding: '0 12px' }}>
                <span style={{ borderBottom: '2px solid #3b82f6', color: '#fff', padding: '8px 12px', fontSize: 13, fontWeight: 'bold' }}>Execution Panel</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {/* AI feedback view */}
                {activeFeedback && (
                  <div style={{ background: activeFeedback.is_correct ? '#064e3b' : '#7f1d1d', border: `1px solid ${activeFeedback.is_correct ? '#059669' : '#b91c1c'}`, padding: 12, borderRadius: 6, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <strong style={{ color: '#fff' }}>AI Critique: {activeFeedback.score}% Correctness</strong>
                      <span style={{ fontSize: 12, color: activeFeedback.is_correct ? '#34d399' : '#f87171', fontWeight: 'bold' }}>{activeFeedback.is_correct ? 'PASSED' : 'RETRY REQUIRED'}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#e5e7eb' }}>{activeFeedback.feedback}</p>
                  </div>
                )}

                {/* Test case stubs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeQ.test_cases.map((tc) => {
                    const isRan = tc.passed !== null
                    const tcPassed = tc.passed === true
                    
                    return (
                      <div key={tc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', padding: '8px 12px', borderRadius: 6, border: '1px solid #1f2937' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{
                            background: isRan ? (tcPassed ? '#065f46' : '#7f1d1d') : '#374151',
                            color: '#fff',
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 'bold'
                          }}>
                            {isRan ? (tcPassed ? '✓' : '✗') : '?'}
                          </span>
                          <span style={{ fontSize: 13, color: '#fff', fontWeight: '500' }}>Test Case:</span>
                          <span style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'Courier New' }}>Input: `{tc.input}`</span>
                          <span style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'Courier New' }}>Expected: `{tc.expected_output}`</span>
                        </div>
                        {isRan && (
                          <span style={{ fontSize: 12, color: tcPassed ? '#34d399' : '#f87171', fontFamily: 'Courier New' }}>
                            Actual: `{tc.actual_output}`
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fullscreen-interview">
      {/* Header */}
      <header className="interview-header">
        <div className="header-left">
          <span className="interview-type-badge">{interviewType.toUpperCase()} Interview</span>
          <span className="question-counter">Question {questionNumber}</span>
          <span className="question-counter">{resumeContextCount ? `${resumeContextCount} resume skills loaded` : 'No resume context'}</span>
        </div>
        <div className="header-center">
          <Clock3 size={20} />
          <span className={timeRemaining < 120 ? 'timer-warning' : ''}>{formatTime(timeRemaining)}</span>
        </div>
        <div className="header-right">
          <button 
            className={`camera-btn ${isCameraOn ? 'active' : ''}`}
            onClick={toggleCamera}
          >
            {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button className="end-btn" onClick={() => handleEndInterview('User ended interview')}>
            <X size={20} />
            End Interview
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="interview-main">
        {/* AI Interviewer Panel */}
        <div className="ai-panel">
          <div className="ai-avatar">
            <motion.div
              animate={{
                scale: isListening ? [1, 1.1, 1] : 1,
                opacity: isListening ? [0.8, 1, 0.8] : 1
              }}
              transition={{
                duration: 1.5,
                repeat: isListening ? Infinity : 0
              }}
              className="avatar-circle"
            >
              <Bot size={64} />
            </motion.div>
            {isListening && (
              <div className="listening-indicator">
                <span>Listening...</span>
              </div>
            )}
          </div>
          <div className="ai-status">
            <h2>AI Interviewer</h2>
            <p>{isSubmitting ? 'Generating next question...' : isListening ? 'Processing your response...' : 'Waiting for your answer...'}</p>
          </div>
        </div>

        {/* Question Display */}
        <div className="question-panel">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="question-card"
              >
                <div className="question-header">
                  <span className="difficulty-badge">{currentQuestion.difficulty}</span>
                  <span className="category-badge">{currentQuestion.category}</span>
                  {['openai', 'ollama'].includes(currentQuestion.source) && <span className="category-badge">AI generated</span>}
                </div>
                <h2>{currentQuestion.question}</h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Display */}
          <AnimatePresence>
            {showFeedback && feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`feedback-card ${feedback.is_correct ? 'correct' : 'incorrect'}`}
              >
                <div className="feedback-icon">
                  {feedback.is_correct ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="feedback-content">
                  <span className="score">Score: {feedback.score}%</span>
                  <p>{feedback.feedback}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Input */}
          {!showFeedback && (
            <div className="answer-section">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer or use voice input..."
                className="answer-textarea"
                disabled={showFeedback || isSubmitting}
              />
              
              {/* Camera Preview */}
              {isCameraOn && (
                <div className="camera-preview">
                  <video ref={videoRef} autoPlay muted playsInline />
                </div>
              )}

              <div className="answer-actions">
                <button
                  className={`voice-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  disabled={isSubmitting}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </button>
                <button
                  className="submit-btn"
                  onClick={submitAnswerHandler}
                  disabled={!answer.trim() || isSubmitting}
                >
                  <Send size={20} />
                  {isSubmitting ? 'Generating...' : 'Submit Answer'}
                </button>
              </div>

              {/* Consecutive Wrong Warning */}
              {consecutiveWrong > 0 && (
                <div className={`warning-badge ${consecutiveWrong >= 2 ? 'critical' : ''}`}>
                  <AlertCircle size={16} />
                  <span>{consecutiveWrong} consecutive wrong answer{consecutiveWrong > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
