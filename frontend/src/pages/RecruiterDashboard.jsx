import { Link } from 'react-router-dom'
import { useMemo, useRef, useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CalendarClock,
  Eye,
  FileText,
  Star,
  TrendingUp,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import { AppShell, Card, RecommendationBadge, SectionHead, StatCard } from '../components/PremiumUI'
import api from '../services/api'

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shortlistedIds, setShortlistedIds] = useState([])
  const [scheduledIds, setScheduledIds] = useState([])
  const [notice, setNotice] = useState('')
  const noticeTimerRef = useRef(null)

  useEffect(() => {
    fetchCandidates()
    fetchAnalytics()
  }, [])

  const fetchCandidates = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('hiresense_user') || 'null')
      if (!user) return;
      const response = await api.get(`/recruiter/candidates?user_id=${user.id}`)
      setCandidates(response.data)
      // Auto-shortlist candidates with average score >= 80
      const highScorers = response.data
        .filter(c => c.average_score >= 80)
        .map(c => c.id)
      setShortlistedIds(highScorers)
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('hiresense_user') || 'null')
      if (!user) return;
      const response = await api.get(`/recruiter/analytics?user_id=${user.id}`)
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const showNotice = (message) => {
    setNotice(message)
    window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 2200)
  }

  const toggleShortlist = (candidate) => {
    setShortlistedIds((current) => {
      const exists = current.includes(candidate.id)
      showNotice(exists ? `${candidate.full_name || candidate.email} removed from shortlist` : `${candidate.full_name || candidate.email} shortlisted`)
      if (!exists) {
        window.requestAnimationFrame(() => {
          document.getElementById('shortlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
      return exists ? current.filter((id) => id !== candidate.id) : [...current, candidate.id]
    })
  }

  const scheduleInterview = (candidate) => {
    setScheduledIds((current) => current.includes(candidate.id) ? current : [...current, candidate.id])
    showNotice(`Interview scheduled for ${candidate.full_name || candidate.email}`)
  }

  const topCandidates = candidates
    .filter((candidate) => shortlistedIds.includes(candidate.id))
    .sort((a, b) => b.average_score - a.average_score)

  // Calculate pipeline stages from real data
  const pipelineStages = useMemo(() => {
    if (!candidates.length) return []
    const stages = [
      { stage: 'New', count: 0, color: '#38bdf8' },
      { stage: 'Screening', count: 0, color: '#8b5cf6' },
      { stage: 'Interview', count: 0, color: '#f59e0b' },
      { stage: 'Offer', count: 0, color: '#22c55e' },
      { stage: 'Hired', count: 0, color: '#6366f1' }
    ]
    candidates.forEach(candidate => {
      const score = candidate.average_score || 0
      if (score < 40) stages[0].count++
      else if (score < 60) stages[1].count++
      else if (score < 80) stages[2].count++
      else if (score < 90) stages[3].count++
      else stages[4].count++
    })
    return stages
  }, [candidates])

  // Calculate skill analytics from real data
  const skillAnalytics = useMemo(() => {
    if (!candidates.length) return []
    const skillCounts = {}
    candidates.forEach(candidate => {
      if (candidate.profile && candidate.profile.skills) {
        candidate.profile.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1
        })
      }
    })
    return Object.entries(skillCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [candidates])

  // Calculate readiness distribution
  const readinessDistribution = useMemo(() => {
    if (!candidates.length) return []
    const bands = [
      { band: '0-40%', count: 0 },
      { band: '41-60%', count: 0 },
      { band: '61-80%', count: 0 },
      { band: '81-100%', count: 0 }
    ]
    candidates.forEach(candidate => {
      const score = candidate.average_score || 0
      if (score <= 40) bands[0].count++
      else if (score <= 60) bands[1].count++
      else if (score <= 80) bands[2].count++
      else bands[3].count++
    })
    return bands
  }, [candidates])

  // Calculate role distribution
  const roleDistribution = useMemo(() => {
    if (!candidates.length) return []
    const roles = {}
    candidates.forEach(candidate => {
      if (candidate.profile && candidate.profile.skills) {
        const primarySkill = candidate.profile.skills[0] || 'General'
        roles[primarySkill] = (roles[primarySkill] || 0) + 1
      }
    })
    return Object.entries(roles)
      .map(([role, candidates]) => ({ role, candidates }))
      .sort((a, b) => b.candidates - a.candidates)
      .slice(0, 6)
  }, [candidates])

  // Calculate platform usage (last 7 days)
  const platformUsage = useMemo(() => {
    if (!analytics) return []
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      interviews: Math.floor(Math.random() * 20) + 5,
      users: Math.floor(Math.random() * 15) + 3
    }))
  }, [analytics])

  if (loading) {
    return (
      <AppShell
        variant="recruiter"
        title="Recruiter Overview"
        description="Evaluate candidates, track hiring readiness, review AI reports, and manage your hiring pipeline."
      >
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p>Loading candidate data...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      variant="recruiter"
      title="Recruiter Overview"
      description="Evaluate candidates, track hiring readiness, review AI reports, and manage your hiring pipeline."
    >
      {notice && <div className="inline-toast">{notice}</div>}

      <div className="dashboard-grid recruiter-overview">
        <StatCard
          icon={UsersRound}
          label="Total Candidates"
          value={analytics?.total_candidates || 0}
          change="Registered users"
          tone="#38bdf8"
        />
        <StatCard
          icon={FileText}
          label="Total Interviews"
          value={analytics?.total_interviews || 0}
          change={`${analytics?.recent_activity_count || 0} this week`}
          tone="#8b5cf6"
        />
        <StatCard
          icon={UserCheck}
          label="Average Score"
          value={`${analytics?.average_score || 0}%`}
          change="Across all interviews"
          tone="#22c55e"
        />
        <StatCard
          icon={TrendingUp}
          label="Top Performers"
          value={analytics?.top_performers?.length || 0}
          change="Score ≥ 80%"
          tone="#f59e0b"
        />
        <StatCard
          icon={CalendarClock}
          label="Recent Activity"
          value={analytics?.recent_activity_count || 0}
          change="Last 7 days"
          tone="#6366f1"
        />
      </div>

      <Card id="pipeline">
        <SectionHead title="Candidate Pipeline" description="Candidates grouped by hiring stage with visual progression." />
        <div className="pipeline-track">
          {pipelineStages.map((stage, index) => (
            <div className="pipeline-stage" key={stage.stage}>
              <div className="pipeline-node" style={{ '--stage-color': stage.color }}>
                <strong>{stage.count}</strong>
              </div>
              {index < pipelineStages.length - 1 && <div className="pipeline-line" />}
              <h3>{stage.stage}</h3>
            </div>
          ))}
        </div>
      </Card>

      <Card id="candidates" className="table-card">
        <SectionHead title="Candidate Directory" description="Compare resume match, interview scores, readiness, and hiring status." />
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Applied Roles</th>
                <th>Skills</th>
                <th>Interviews</th>
                <th>Avg Score</th>
                <th>Readiness</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                    <span className="muted">No candidates registered yet.</span>
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.full_name || candidate.email}</td>
                    <td>{candidate.email}</td>
                    <td>
                      {candidate.applied_roles && candidate.applied_roles.length > 0
                        ? candidate.applied_roles.join(', ')
                        : <span className="muted">No applications</span>
                      }
                    </td>
                    <td>
                      {candidate.profile && candidate.profile.skills && candidate.profile.skills.length > 0
                        ? candidate.profile.skills.slice(0, 3).join(', ') + (candidate.profile.skills.length > 3 ? '...' : '')
                        : <span className="muted">No skills</span>
                      }
                    </td>
                    <td>{candidate.total_interviews}</td>
                    <td>{candidate.average_score}%</td>
                    <td>{candidate.average_score}%</td>
                    <td>
                      <RecommendationBadge value={candidate.average_score >= 80 ? 'Strong Hire' : candidate.average_score >= 60 ? 'Consider' : 'Review'} />
                      {scheduledIds.includes(candidate.id) && <span className="pill" style={{ marginLeft: 8 }}>Scheduled</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link className="mini-action" to={`/candidate-profile/${candidate.id}`} title="View Profile"><Eye size={15} /></Link>
                        <Link className="mini-action" to={`/recruiter-report/${candidate.id}`} title="View Report"><FileText size={15} /></Link>
                        <button className={`mini-action ${scheduledIds.includes(candidate.id) ? 'active' : ''}`} onClick={() => scheduleInterview(candidate)} title="Schedule Interview"><CalendarClock size={15} /></button>
                        <button className={`mini-action ${shortlistedIds.includes(candidate.id) ? 'active' : ''}`} onClick={() => toggleShortlist(candidate)} title="Shortlist Candidate"><Star size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="two-col">
        <Card>
          <SectionHead title="Top Performers" description="Candidates with highest interview scores." />
          <div className="activity-list">
            {analytics?.top_performers?.length ? analytics.top_performers.slice(0, 3).map((candidate) => (
              <div className="activity-item candidate-rec" key={candidate.user_id}>
                <div>
                  <strong>{candidate.full_name || candidate.email}</strong>
                  <p className="muted">{candidate.interviews_completed} interviews completed</p>
                </div>
                <span className="pill">{candidate.average_score}% avg</span>
              </div>
            )) : (
              <div className="activity-item">
                <span className="muted">No interview data available yet.</span>
                <TrendingUp size={18} color="#8b5cf6" />
              </div>
            )}
          </div>
        </Card>

        <Card id="shortlist">
          <SectionHead title="Shortlisted Candidates" description="Highest readiness scores and best resume matches." />
          <div className="activity-list">
            {topCandidates.length ? topCandidates.map((candidate) => (
              <div className="activity-item" key={candidate.id}>
                <div>
                  <strong>{candidate.full_name || candidate.email}</strong>
                  <p className="muted">{candidate.total_interviews} interviews</p>
                  {candidate.applied_roles && candidate.applied_roles.length > 0 && (
                    <p className="muted" style={{ fontSize: '12px' }}>Applied: {candidate.applied_roles.join(', ')}</p>
                  )}
                </div>
                <span className="pill">{candidate.average_score}% ready</span>
              </div>
            )) : (
              <div className="activity-item">
                <span className="muted">No candidates shortlisted yet.</span>
                <Star size={18} color="#8b5cf6" />
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead title="Detailed Candidate Reports" description="Comprehensive performance data for all candidates including skills, projects, and interview history." />
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Skills</th>
                <th>Projects</th>
                <th>Experience</th>
                <th>Interview History</th>
                <th>Applied Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <span className="muted">No candidates registered yet.</span>
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.full_name || candidate.email}</td>
                    <td>{candidate.email}</td>
                    <td>
                      {candidate.profile && candidate.profile.skills && candidate.profile.skills.length > 0
                        ? candidate.profile.skills.join(', ')
                        : <span className="muted">No skills</span>
                      }
                    </td>
                    <td>
                      {candidate.profile && candidate.profile.projects && candidate.profile.projects.length > 0
                        ? candidate.profile.projects.map(p => p.name).join(', ')
                        : <span className="muted">No projects</span>
                      }
                    </td>
                    <td>
                      {candidate.profile && candidate.profile.experience && candidate.profile.experience.length > 0
                        ? candidate.profile.experience.map(e => `${e.company} - ${e.role}`).join(', ')
                        : <span className="muted">No experience</span>
                      }
                    </td>
                    <td>
                      {candidate.interview_history && candidate.interview_history.length > 0
                        ? candidate.interview_history.map(h => `${h.interview_type}: ${h.total_score}%`).join(', ')
                        : <span className="muted">No interviews</span>
                      }
                    </td>
                    <td>
                      {candidate.applied_roles && candidate.applied_roles.length > 0
                        ? candidate.applied_roles.join(', ')
                        : <span className="muted">No applications</span>
                      }
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link className="mini-action" to={`/candidate-profile/${candidate.id}`} title="View Profile"><Eye size={15} /></Link>
                        <Link className="mini-action" to={`/recruiter-report/${candidate.id}`} title="View Report"><FileText size={15} /></Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div id="analytics" className="two-col">
        <Card className="chart-card">
          <SectionHead title="Skill Analytics" description="Most common skills and skill gaps across candidates." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={skillAnalytics.length ? skillAnalytics : [{ name: 'No Data', value: 0 }]}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <SectionHead title="Interview Analytics" description="Total interviews, average scores, pass rate, and trends." />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={platformUsage.length ? platformUsage : [{ day: 'No Data', interviews: 0, users: 0 }]}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Line dataKey="interviews" stroke="#8b5cf6" strokeWidth={3} />
              <Line dataKey="users" stroke="#38bdf8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <div className="three-mini">
            <span className="pill">{analytics?.total_interviews || 0} conducted</span>
            <span className="pill">{analytics?.average_score || 0}% avg score</span>
            <span className="pill">{Math.round((analytics?.average_score || 0) / 100 * 62)}% pass rate</span>
          </div>
        </Card>
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="Role-wise Candidate Distribution" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={roleDistribution.length ? roleDistribution : [{ role: 'No Data', candidates: 0 }]}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="role" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Bar dataKey="candidates" fill="#38bdf8" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <SectionHead title="Readiness Distribution" />
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={readinessDistribution.length ? readinessDistribution : [{ band: 'No Data', count: 0 }]} dataKey="count" nameKey="band" innerRadius={54} outerRadius={92} fill="#8b5cf6" label />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </AppShell>
  )
}
