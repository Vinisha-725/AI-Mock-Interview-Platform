import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function CandidateDashboard() {
  const navigate = useNavigate()

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar role="candidate" />
        <div style={{ flex: 1, padding: '20px' }}>
          <h1>Candidate Dashboard</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate('/resume-upload')}>
              <h3>Upload Resume</h3>
              <p>Upload your resume to get started</p>
            </div>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate('/interview-room')}>
              <h3>Start Interview</h3>
              <p>Begin your AI-powered interview</p>
            </div>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate('/report/1')}>
              <h3>View Report</h3>
              <p>Check your interview performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
