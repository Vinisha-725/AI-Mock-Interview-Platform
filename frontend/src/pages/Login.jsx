import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BriefcaseBusiness, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { Logo } from '../components/PremiumUI'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'candidate',
}

export default function Login() {
  const location = useLocation()
  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const isRegister = mode === 'register'

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (isRegister && form.name.trim().length < 2) {
      setError('Enter your name to create an account.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Enter a valid email address.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    const user = {
      name: isRegister ? form.name.trim() : form.email.split('@')[0],
      email: form.email,
      role: form.role,
      signedInAt: new Date().toISOString(),
    }

    localStorage.setItem('hiresense_user', JSON.stringify(user))
    navigate(form.role === 'recruiter' ? '/admin' : '/candidate-dashboard')
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <motion.section className="auth-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Logo />
          <div>
            <span className="eyebrow">
              <Sparkles size={16} />
              Dummy auth enabled for demo
            </span>
            <h1>Ace Every Interview With AI</h1>
            <p>Register or login to enter the HireSense AI dashboard. This uses local demo storage now, ready for your friend to connect a real database later.</p>
          </div>
          <div className="auth-benefits">
            <div className="activity-item"><ShieldCheck size={18} color="#22c55e" /><span>Frontend-only demo session</span></div>
            <div className="activity-item"><UserRound size={18} color="#a5b4fc" /><span>Candidate and recruiter roles</span></div>
            <div className="activity-item"><BriefcaseBusiness size={18} color="#38bdf8" /><span>Redirects to the right dashboard</span></div>
          </div>
        </motion.section>

        <motion.section className="auth-card glass" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>

          <form onSubmit={handleSubmit}>
            <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
            <p className="muted">{isRegister ? 'Set up your demo profile and continue.' : 'Use any valid demo details to continue.'}</p>

            {isRegister && (
              <label className="form-field">
                <span>Full name</span>
                <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Vinisha Sharma" />
              </label>
            )}

            <label className="form-field">
              <span>Email</span>
              <div className="input-icon">
                <Mail size={17} />
                <input value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" />
              </div>
            </label>

            <label className="form-field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Minimum 6 characters" />
            </label>

            <label className="form-field">
              <span>Continue as</span>
              <select value={form.role} onChange={(event) => updateField('role', event.target.value)}>
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter / Admin</option>
              </select>
            </label>

            {error && <div className="form-error">{error}</div>}

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 18 }}>
              {isRegister ? 'Register & Continue' : 'Login & Continue'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footnote">
            Need the marketing page? <Link to="/">Back to landing</Link>
          </p>
        </motion.section>
      </div>
    </main>
  )
}
