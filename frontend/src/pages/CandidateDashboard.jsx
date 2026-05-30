import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function CandidateDashboard() {
  const navigate = useNavigate()

  // Mock profile data
  const profile = {
    targetRole: "Full Stack Developer",
    experience: "3 years",
    resume: "resume_john_doe.pdf",
    latestScore: 78
  }

  // Mock statistics
  const statistics = {
    interviewsTaken: 5,
    avgScore: 72,
    bestScore: 85,
    currentReadiness: 78
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar role="candidate" />
        <div style={{ flex: 1, padding: '30px', backgroundColor: '#f5f5f5' }}>
          <h1 style={{ marginBottom: '30px' }}>Candidate Dashboard</h1>

          {/* Profile Summary Section */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Profile Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Target Role</p>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{profile.targetRole}</p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Experience</p>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{profile.experience}</p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Resume</p>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{profile.resume}</p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Latest Score</p>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>{profile.latestScore}/100</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <button 
                onClick={() => navigate('/resume-upload')}
                style={{ padding: '25px', border: '2px solid #2196f3', borderRadius: '12px', backgroundColor: '#e3f2fd', cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#bbdefb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#e3f2fd'}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📄 Upload Resume</h3>
                <p style={{ margin: '0', color: '#555' }}>Upload your resume to get started</p>
              </button>
              <button 
                onClick={() => navigate('/interview-room')}
                style={{ padding: '25px', border: '2px solid #4caf50', borderRadius: '12px', backgroundColor: '#e8f5e9', cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c8e6c9'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#e8f5e9'}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>🎤 Start Interview</h3>
                <p style={{ margin: '0', color: '#555' }}>Begin your AI-powered interview</p>
              </button>
              <button 
                onClick={() => navigate('/report/1')}
                style={{ padding: '25px', border: '2px solid #ff9800', borderRadius: '12px', backgroundColor: '#fff3e0', cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#ffe0b2'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#fff3e0'}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#e65100' }}>📊 View Reports</h3>
                <p style={{ margin: '0', color: '#555' }}>Check your interview performance</p>
              </button>
            </div>
          </div>

          {/* Statistics Section */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Interviews Taken</p>
                <p style={{ margin: '0', fontSize: '36px', fontWeight: 'bold', color: '#7b1fa2' }}>{statistics.interviewsTaken}</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Average Score</p>
                <p style={{ margin: '0', fontSize: '36px', fontWeight: 'bold', color: '#1976d2' }}>{statistics.avgScore}</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Best Score</p>
                <p style={{ margin: '0', fontSize: '36px', fontWeight: 'bold', color: '#2e7d32' }}>{statistics.bestScore}</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Current Readiness</p>
                <p style={{ margin: '0', fontSize: '36px', fontWeight: 'bold', color: '#e65100' }}>{statistics.currentReadiness}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
