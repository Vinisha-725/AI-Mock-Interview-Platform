import { Link } from 'react-router-dom'

export default function Sidebar({ role }) {
  const candidateLinks = [
    { path: '/candidate-dashboard', label: 'Dashboard' },
    { path: '/resume-upload', label: 'Upload Resume' },
    { path: '/interview-room', label: 'Interview Room' },
    { path: '/report/1', label: 'Reports' }
  ]

  const recruiterLinks = [
    { path: '/recruiter-dashboard', label: 'Dashboard' },
    { path: '/report/1', label: 'Candidate Reports' }
  ]

  const links = role === 'candidate' ? candidateLinks : recruiterLinks

  return (
    <aside style={{ width: '250px', backgroundColor: '#f5f5f5', padding: '20px', minHeight: 'calc(100vh - 60px)' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {links.map((link) => (
          <li key={link.path} style={{ marginBottom: '10px' }}>
            <Link 
              to={link.path}
              style={{ textDecoration: 'none', color: '#333', display: 'block', padding: '10px', borderRadius: '5px' }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
