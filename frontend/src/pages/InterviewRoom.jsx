import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import Timer from '../components/Timer'
import ScoreCard from '../components/ScoreCard'
import { submitAnswer } from '../services/interview'

export default function InterviewRoom() {
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 1,
    question: "Tell me about yourself and your experience.",
    difficulty: "easy"
  })
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(null)
  const [totalScore, setTotalScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    const response = await submitAnswer({
      question_id: currentQuestion.id,
      answer: answer,
      previous_score: totalScore
    })

    setScore(response.score)
    setTotalScore(response.total_score)
    setQuestionCount(prev => prev + 1)

    if (response.next_question) {
      setCurrentQuestion(response.next_question)
      setAnswer('')
    } else {
      setIsFinished(true)
    }
  }

  const handleFinish = () => {
    navigate(`/report/${Date.now()}`)
  }

  if (isFinished) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
          <h1>Interview Completed!</h1>
          <ScoreCard score={totalScore} questionCount={questionCount} />
          <button 
            onClick={handleFinish}
            style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
          >
            View Full Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Interview Room</h1>
          <Timer />
        </div>
        <QuestionCard question={currentQuestion} />
        <div style={{ marginTop: '20px' }}>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            style={{ width: '100%', minHeight: '150px', padding: '10px', fontSize: '16px' }}
          />
          <button 
            onClick={handleSubmit}
            disabled={!answer.trim()}
            style={{ padding: '10px 20px', cursor: answer.trim() ? 'pointer' : 'not-allowed', marginTop: '10px' }}
          >
            Submit Answer
          </button>
        </div>
        {score !== null && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
            <h3>Last Answer Score: {score}/100</h3>
            <p>Total Score: {totalScore}</p>
          </div>
        )}
      </div>
    </div>
  )
}
