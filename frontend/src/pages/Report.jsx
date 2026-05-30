import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ScoreCard from '../components/ScoreCard'

export default function Report() {
  const { id } = useParams()
  const [report, setReport] = useState(null)

  useEffect(() => {
    // Mock report data
    setReport({
      readiness_score: 78,
      strengths: [
        "Strong technical knowledge in JavaScript and React",
        "Good communication skills",
        "Problem-solving approach is structured"
      ],
      weaknesses: [
        "Could improve on system design concepts",
        "Needs more experience with backend technologies",
        "Time management during coding challenges"
      ],
      question_count: 5,
      total_score: 78
    })
  }, [id])

  if (!report) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <h1>Interview Report</h1>
        <ScoreCard score={report.total_score} questionCount={report.question_count} />
        
        <div style={{ marginTop: '30px' }}>
          <h2>Readiness Score: {report.readiness_score}%</h2>
        </div>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
          <h3>Strengths</h3>
          <ul style={{ marginTop: '10px' }}>
            {report.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
          <h3>Areas for Improvement</h3>
          <ul style={{ marginTop: '10px' }}>
            {report.weaknesses.map((weakness, index) => (
              <li key={index}>{weakness}</li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => window.print()}
          style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
        >
          Print Report
        </button>
      </div>
    </div>
  )
}
