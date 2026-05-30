export default function QuestionCard({ question }) {
  return (
    <div style={{ padding: '25px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '5px 10px', borderRadius: '15px', fontSize: '12px' }}>
          {question.difficulty}
        </span>
        <span style={{ color: '#666' }}>Question {question.id}</span>
      </div>
      <h3 style={{ margin: '0 0 15px 0' }}>{question.question}</h3>
    </div>
  )
}
