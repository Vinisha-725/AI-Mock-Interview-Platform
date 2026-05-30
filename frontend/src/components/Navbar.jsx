import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <nav style={{ backgroundColor: '#333', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0 }}>AI Interview Platform</h2>
      <div>
        <Link to="/candidate-dashboard" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>
          Dashboard
        </Link>
        <button 
          onClick={handleLogout}
          style={{ padding: '5px 15px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
