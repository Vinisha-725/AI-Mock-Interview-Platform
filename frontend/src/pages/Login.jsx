import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Login() {
  const [role, setRole] = useState('candidate')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (role === 'candidate') {
      navigate('/candidate-dashboard')
    } else {
      navigate('/recruiter-dashboard')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input 
              type="email" 
              placeholder="Enter email"
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input 
              type="password" 
              placeholder="Enter password"
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
