import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronRight,
  FileSearch,
  Gauge,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Mic,
  PanelLeft,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react'

const sidebarItems = [
  { label: 'Dashboard', path: '/candidate-dashboard', icon: LayoutDashboard },
  { label: 'Resume Analysis', path: '/resume-upload', icon: FileSearch },
  { label: 'Job Description', path: '/resume-upload', icon: BriefcaseBusiness },
  { label: 'Mock Interview', path: '/interview-room', icon: Mic },
  { label: 'Reports', path: '/report/latest', icon: ChartNoAxesCombined },
  { label: 'Career Coach', path: '/career-coach', icon: BrainCircuit },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export function Logo() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <Sparkles size={21} />
      </span>
      <span>HireSense AI</span>
    </Link>
  )
}

export function LandingNav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <Link to="/candidate-dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
        </nav>
        <div className="actions">
          <Link className="btn btn-ghost" to="/candidate-dashboard">View Demo</Link>
          <Link className="btn btn-primary" to="/login">Start Interview</Link>
        </div>
      </div>
    </header>
  )
}

export function AppShell({ children, title, description }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo />
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.label} to={item.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <main className="main">
        <Topbar />
        <div className="content">
          {(title || description) && (
            <div className="page-title">
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

export function Topbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('hiresense_user') || 'null')
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'V'

  const handleLogout = () => {
    localStorage.removeItem('hiresense_user')
    navigate('/login')
  }

  return (
    <div className="topbar">
      <div className="search">
        <Search size={18} />
        <input placeholder="Search interviews, reports, roles..." />
      </div>
      <div className="actions">
        <button className="icon-btn" aria-label="Toggle sidebar">
          <PanelLeft size={18} />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="icon-btn" aria-label="Logout" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
        <div className="avatar">{initial}</div>
      </div>
    </div>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`panel-card glass ${className}`}>{children}</div>
}

export function StatCard({ icon: Icon = Gauge, label, value, change, tone = '#8b5cf6' }) {
  return (
    <motion.div className="stat-card glass" whileHover={{ y: -5 }}>
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={20} color={tone} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-change">{change}</div>
    </motion.div>
  )
}

export function SectionHead({ title, description, action }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ScoreRing({ score = 86, label = 'Ready' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="score-ring" style={{ '--score': score }}>
        <div className="score-inner">{score}</div>
      </div>
      <strong>{label}</strong>
      <p className="muted" style={{ margin: '8px 0 0' }}>Hiring readiness score</p>
    </div>
  )
}

export function PillList({ items, empty = 'No data yet', className = '' }) {
  if (!items?.length) {
    return (
      <div className="activity-item">
        <span className="muted">{empty}</span>
        <Bot size={18} color="#8b5cf6" />
      </div>
    )
  }

  return (
    <div className={`skill-list ${className}`}>
      {items.map((item) => (
        <span className="pill" key={item}>
          <Sparkles size={14} />
          {item}
        </span>
      ))}
    </div>
  )
}

export function ActivityList({ items }) {
  return (
    <div className="activity-list">
      {items.map((item, index) => (
        <div className="activity-item" key={item}>
          <span>{item}</span>
          <ChevronRight size={17} color="#9ca3af" />
        </div>
      ))}
      {!items.length && <SkeletonRows />}
    </div>
  )
}

export function SkeletonRows() {
  return (
    <>
      <div className="skeleton" style={{ width: '100%', height: 42 }} />
      <div className="skeleton" style={{ width: '88%', height: 42 }} />
      <div className="skeleton" style={{ width: '96%', height: 42 }} />
    </>
  )
}

export function MetricCard({ label, value, icon: Icon = MessageSquareText }) {
  return (
    <div className="metric-card glass">
      <Icon size={20} color="#a5b4fc" />
      <strong>{value}</strong>
      <span className="muted">{label}</span>
    </div>
  )
}
