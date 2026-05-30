import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Clock3, Mic, MicOff, Send, X, Volume2, AlertCircle, CheckCircle2, Video, VideoOff } from 'lucide-react'
import { startInterview, submitAnswer, endInterview } from '../services/interview'
import { detectedSkills, missingSkills } from '../data/mockData'

export default function InterviewRoomFullScreen() {
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
  
  const recognitionRef = useRef(null)
  const videoRef = useRef(null)

  // Request fullscreen on mount
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
          setIsFullscreen(true)
        }
      } catch (err) {
        console.log('Fullscreen request failed:', err)
      }
    }
    requestFullscreen()

    // Prevent escape from fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !interviewEnded) {
        // Try to re-enter fullscreen
        requestFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [interviewEnded])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !interviewEnded && interviewId) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeRemaining <= 0 && interviewId) {
      handleEndInterview('Time limit reached')
    }
  }, [timeRemaining, interviewId, interviewEnded])

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
    setInterviewType(type)
    setShowTypeSelector(false)
    
    try {
      const response = await startInterview({
        skills: detectedSkills,
        projects: [
          { name: 'E-commerce Platform', description: 'Full-stack web application', tech: ['React', 'Node.js', 'MongoDB'] },
          { name: 'Task Manager', description: 'Productivity app', tech: ['React', 'Firebase'] }
        ],
        jd_text: '',
        interview_type: type
      })
      
      setInterviewId(response.interview_id)
      setCurrentQuestion(response.question)
      setTimeRemaining(response.duration_minutes * 60)
    } catch (error) {
      console.error('Failed to start interview:', error)
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
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
      setIsListening(true)
      setTranscript('')
    }
  }

  const submitAnswerHandler = async () => {
    if (!answer.trim() || !interviewId) return

    try {
      const response = await submitAnswer({
        interview_id: interviewId,
        question_id: currentQuestion.id,
        answer: answer,
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
    window.location.href = '/candidate-dashboard'
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
    return (
      <div className="fullscreen-interview">
        <div className="interview-type-selector">
          <h1>Select Interview Type</h1>
          <div className="type-options">
            <button className="type-card" onClick={() => startInterviewSession('ai')}>
              <Bot size={48} />
              <h2>AI Interview</h2>
              <p>Questions based on your resume and skills with adaptive difficulty</p>
            </button>
            <button className="type-card" onClick={() => startInterviewSession('dsa')}>
              <Volume2 size={48} />
              <h2>DSA Practice</h2>
              <p>Data Structures and Algorithms coding questions</p>
            </button>
            <button className="type-card" onClick={() => startInterviewSession('aptitude')}>
              <CheckCircle2 size={48} />
              <h2>Aptitude Test</h2>
              <p>Quantitative and logical reasoning questions</p>
            </button>
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

  return (
    <div className="fullscreen-interview">
      {/* Header */}
      <header className="interview-header">
        <div className="header-left">
          <span className="interview-type-badge">{interviewType.toUpperCase()} Interview</span>
          <span className="question-counter">Question {questionNumber}</span>
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
            <p>{isListening ? 'Processing your response...' : 'Waiting for your answer...'}</p>
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
                disabled={showFeedback}
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
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </button>
                <button
                  className="submit-btn"
                  onClick={submitAnswerHandler}
                  disabled={!answer.trim()}
                >
                  <Send size={20} />
                  Submit Answer
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
