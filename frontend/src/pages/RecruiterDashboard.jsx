import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function RecruiterDashboard() {
  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar role="recruiter" />
        <div style={{ flex: 1, padding: '20px' }}>
          <h1>Recruiter Dashboard</h1>
          <div style={{ marginTop: '20px' }}>
            <h2>Candidate Reviews</h2>
            <div style={{ marginTop: '10px' }}>
              <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
                <h3>John Doe</h3>
                <p>Score: 85/100</p>
                <p>Status: Completed</p>
              </div>
              <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
                <h3>Jane Smith</h3>
                <p>Score: 72/100</p>
                <p>Status: In Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
