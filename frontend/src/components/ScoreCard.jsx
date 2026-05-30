export default function ScoreCard({ score, questionCount }) {
  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'
    if (score >= 60) return '#ff9800'
    return '#f44336'
  }

  return (
    <div style={{ padding: '25px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ margin: '0 0 15px 0' }}>Your Score</h2>
      <div style={{ 
        fontSize: '48px', 
        fontWeight: 'bold', 
        color: getScoreColor(score),
        marginBottom: '10px' 
      }}>
        {score}/100
      </div>
      <p style={{ color: '#666', margin: '0' }}>
        Questions Answered: {questionCount}
      </p>
    </div>
  )
}
