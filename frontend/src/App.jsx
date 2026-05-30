import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import CandidateDashboard from './pages/CandidateDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import InterviewRoom from './pages/InterviewRoom'
import InterviewRoomFullScreen from './pages/InterviewRoomFullScreen'
import ResumeUpload from './pages/ResumeUpload'
import Report from './pages/Report'
import Settings from './pages/Settings'
import CareerCoach from './pages/CareerCoach'
import CandidateProfile from './pages/CandidateProfile'
import RecruiterReport from './pages/RecruiterReport'
import RecruiterSettings from './pages/RecruiterSettings'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/dashboard" element={<CandidateDashboard />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/admin" element={<RecruiterDashboard />} />
        <Route path="/interview-room" element={<InterviewRoom />} />
        <Route path="/interview-fullscreen" element={<InterviewRoomFullScreen />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/resume-analysis" element={<ResumeUpload />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/career-coach" element={<CareerCoach />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/candidate-profile/:id" element={<CandidateProfile />} />
        <Route path="/recruiter-report/:id" element={<RecruiterReport />} />
        <Route path="/recruiter-settings" element={<RecruiterSettings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  )
}

export default App
