import { Link } from 'react-router-dom'
import { useMemo, useRef, useState } from 'react'
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
import {
  candidatePipeline,
  platformUsage,
  readinessDistribution,
  recruiterCandidates,
  recruiterOverview,
  recruiterSkillAnalytics,
  recruiterSkillGaps,
  roleDistribution,
} from '../data/mockData'

export default function RecruiterDashboard() {
  const defaultShortlist = useMemo(() => recruiterCandidates.filter((candidate) => candidate.readiness >= 80).map((candidate) => candidate.id), [])
  const [shortlistedIds, setShortlistedIds] = useState(defaultShortlist)
  const [scheduledIds, setScheduledIds] = useState([])
  const [notice, setNotice] = useState('')
  const noticeTimerRef = useRef(null)

  const showNotice = (message) => {
    setNotice(message)
    window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 2200)
  }

  const toggleShortlist = (candidate) => {
    setShortlistedIds((current) => {
      const exists = current.includes(candidate.id)
      showNotice(exists ? `${candidate.name} removed from shortlist` : `${candidate.name} shortlisted`)
      return exists ? current.filter((id) => id !== candidate.id) : [...current, candidate.id]
    })
  }

  const scheduleInterview = (candidate) => {
    setScheduledIds((current) => current.includes(candidate.id) ? current : [...current, candidate.id])
    showNotice(`Interview scheduled for ${candidate.name}`)
  }

  const topCandidates = recruiterCandidates
    .filter((candidate) => shortlistedIds.includes(candidate.id))
    .sort((a, b) => b.readiness - a.readiness)

  return (
    <AppShell
      variant="recruiter"
      title="Recruiter Overview"
      description="Evaluate candidates, track hiring readiness, review AI reports, and manage your hiring pipeline."
    >
      {notice && <div className="inline-toast">{notice}</div>}

      <div className="dashboard-grid recruiter-overview">
        {recruiterOverview.map((item, index) => (
          <StatCard
            key={item.label}
            icon={[UsersRound, FileText, UserCheck, TrendingUp, CalendarClock][index]}
            label={item.label}
            value={item.value}
            change={item.change}
            tone={['#38bdf8', '#8b5cf6', '#22c55e', '#f59e0b', '#6366f1'][index]}
          />
        ))}
      </div>

      <Card id="pipeline">
        <SectionHead title="Candidate Pipeline" description="Candidates grouped by hiring stage with visual progression." />
        <div className="pipeline-track">
          {candidatePipeline.map((stage, index) => (
            <div className="pipeline-stage" key={stage.stage}>
              <div className="pipeline-node" style={{ '--stage-color': stage.color }}>
                <strong>{stage.count}</strong>
              </div>
              {index < candidatePipeline.length - 1 && <div className="pipeline-line" />}
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
                <th>Target Role</th>
                <th>Resume Match</th>
                <th>Readiness</th>
                <th>Interview</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recruiterCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.targetRole}</td>
                  <td>{candidate.resumeMatch}%</td>
                  <td>{candidate.readiness}%</td>
                  <td>{candidate.interviewScore}%</td>
                  <td>
                    <RecommendationBadge value={candidate.recommendation} />
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="two-col">
        <Card>
          <SectionHead title="AI Hiring Recommendation" description="AI-generated reasoning for top candidate decisions." />
          <div className="activity-list">
            {recruiterCandidates.slice(0, 3).map((candidate) => (
              <div className="activity-item candidate-rec" key={candidate.id}>
                <div>
                  <strong>{candidate.name}</strong>
                  <p className="muted">{candidate.reasoning}</p>
                </div>
                <RecommendationBadge value={candidate.recommendation} />
              </div>
            ))}
          </div>
        </Card>

        <Card id="shortlist">
          <SectionHead title="Shortlisted Candidates" description="Highest readiness scores and best resume matches." />
          <div className="activity-list">
            {topCandidates.length ? topCandidates.map((candidate) => (
              <div className="activity-item" key={candidate.id}>
                <div>
                  <strong>{candidate.name}</strong>
                  <p className="muted">{candidate.targetRole}</p>
                </div>
                <span className="pill">{candidate.readiness}% ready</span>
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

      <div id="analytics" className="two-col">
        <Card className="chart-card">
          <SectionHead title="Skill Analytics" description="Most common skills and skill gaps across candidates." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={recruiterSkillAnalytics}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="skill-gap-list">
            {recruiterSkillGaps.map((gap) => <span className="pill" key={gap.name}>{gap.name}: {gap.value}</span>)}
          </div>
        </Card>

        <Card className="chart-card">
          <SectionHead title="Interview Analytics" description="Total interviews, average scores, pass rate, and trends." />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={platformUsage}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Line dataKey="interviews" stroke="#8b5cf6" strokeWidth={3} />
              <Line dataKey="users" stroke="#38bdf8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <div className="three-mini">
            <span className="pill">312 conducted</span>
            <span className="pill">79% avg score</span>
            <span className="pill">62% pass rate</span>
          </div>
        </Card>
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="Role-wise Candidate Distribution" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={roleDistribution}>
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
              <Pie data={readinessDistribution} dataKey="count" nameKey="band" innerRadius={54} outerRadius={92} fill="#8b5cf6" label />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </AppShell>
  )
}
