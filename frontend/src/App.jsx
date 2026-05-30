import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import CandidateDashboard from './pages/CandidateDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import InterviewRoom from './pages/InterviewRoom'
import ResumeUpload from './pages/ResumeUpload'
import Report from './pages/Report'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/interview-room" element={<InterviewRoom />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </Router>
  )
}

export default App
