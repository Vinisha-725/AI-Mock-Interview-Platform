import { useState, useEffect } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BriefcaseBusiness, CheckCircle2, Clock3, Gauge, Target } from 'lucide-react'
import { ActivityList, AppShell, Card, SectionHead, StatCard } from '../components/PremiumUI'
import { getHistory } from '../services/interview'
import api from '../services/api'

export default function CandidateDashboard() {
  const [sessionHistory, setSessionHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    totalDuration: 0,
    completedThisWeek: 0
  })

  useEffect(() => {
    fetchSessionHistory()
    fetchProfile()
  }, [])

  const fetchSessionHistory = async () => {
    try {
      const history = await getHistory()
      setSessionHistory(history)

      // Calculate stats
      const completedSessions = history.filter(s => s.status === 'completed')
      const totalScore = completedSessions.reduce((sum, s) => sum + s.total_score, 0)
      const totalDuration = history.reduce((sum, s) => sum + s.duration_minutes, 0)

      // Calculate completed this week (simple implementation)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const completedThisWeek = history.filter(s =>
        new Date(s.date) >= oneWeekAgo && s.status === 'completed'
      ).length

      setStats({
        totalInterviews: history.length,
        averageScore: completedSessions.length > 0 ? Math.round(totalScore / completedSessions.length) : 0,
        totalDuration: Math.round(totalDuration / 60 * 10) / 10, // Convert to hours
        completedThisWeek
      })
    } catch (error) {
      console.error('Failed to fetch session history:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/candidate/profile')
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  // Generate chart data from session history
  const readinessTrend = sessionHistory.slice(-6).map((session, index) => ({
    week: `Session ${index + 1}`,
    score: session.total_score,
    confidence: Math.min(session.total_score + 10, 100)
  }))

  // Generate recent activity from session history
  const recentActivity = sessionHistory.slice(-5).reverse().map(session => {
    const date = new Date(session.date)
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${session.interview_type.toUpperCase()} interview - ${session.total_score}% score`
  })

  // Generate skill growth data based on actual profile skills
  const skillGrowth = profile?.profile?.skills?.length > 0
    ? profile.profile.skills.slice(0, 4).map((skill, index) => ({
        skill: skill,
        current: stats.averageScore,
        target: 85
      }))
    : [
        { skill: 'Technical', current: stats.averageScore, target: 85 },
        { skill: 'Communication', current: Math.max(stats.averageScore - 10, 50), target: 80 },
        { skill: 'Problem Solving', current: Math.max(stats.averageScore - 5, 55), target: 85 },
        { skill: 'System Design', current: Math.max(stats.averageScore - 15, 40), target: 75 },
      ]

  if (loading) {
    return (
      <AppShell title="Loading..." description="Track your interview readiness, resume alignment, and weekly skill growth.">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p>Loading your dashboard...</p>
        </div>
      </AppShell>
    )
  }

  const completedThisWeekText = stats.completedThisWeek > 0 ? `${stats.completedThisWeek} this week` : 'No interviews this week'
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Candidate'

  return (
    <AppShell title={`Welcome back, ${displayName}`} description="Track your interview readiness, resume alignment, and weekly skill growth.">
      <div className="dashboard-grid">
        <StatCard icon={Gauge} label="Average Score" value={`${stats.averageScore}%`} change="Based on completed interviews" tone="#8b5cf6" />
        <StatCard icon={Target} label="Interviews Completed" value={stats.totalInterviews} change={completedThisWeekText} tone="#38bdf8" />
        <StatCard icon={CheckCircle2} label="Practice Time" value={`${stats.totalDuration}h`} change="Total interview time" tone="#22c55e" />
        <StatCard icon={Clock3} label="Sessions" value={sessionHistory.length} change="All interview types" tone="#f59e0b" />
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="Progress Graph" description="Readiness and confidence trend over your recent sessions." />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={readinessTrend.length > 0 ? readinessTrend : [{ week: 'No Data', score: 0, confidence: 0 }]}>
              <defs>
                <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#score)" strokeWidth={3} />
              <Area type="monotone" dataKey="confidence" stroke="#38bdf8" fill="transparent" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHead title="Recent Activity" description="Latest interview sessions." />
          <ActivityList items={recentActivity.length > 0 ? recentActivity : ['No interview sessions yet. Start your first interview!']} />
        </Card>
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="Skill Growth" description="Current proficiency against target score." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={skillGrowth}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="skill" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Bar dataKey="current" radius={[12, 12, 0, 0]} fill="#6366f1" />
              <Bar dataKey="target" radius={[12, 12, 0, 0]} fill="#38bdf8" opacity={0.55} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <BriefcaseBusiness color="#a5b4fc" />
          <h3>Next best action</h3>
          <p>{sessionHistory.length === 0
            ? "Start your first AI interview to begin tracking your progress."
            : "Continue practicing to improve your interview skills and readiness score."}
          </p>
          <div style={{ marginTop: 20 }}>
            <a className="btn btn-primary" href="/interview-fullscreen">
              {sessionHistory.length === 0 ? 'Start Interview' : 'Practice Again'}
            </a>
          </div>
        </Card>

        <Card>
          <SectionHead title="Your Profile" description="Your saved profile information." />
          <div className="activity-list">
            <div className="activity-item">
              <span>Target Role</span>
              <strong>{profile?.profile?.target_role || profile?.target_role || 'Not set'}</strong>
            </div>
            <div className="activity-item">
              <span>Skills</span>
              <strong>{profile?.profile?.skills?.length || profile?.skills?.length || 0} skills</strong>
            </div>
            <div className="activity-item">
              <span>Projects</span>
              <strong>{profile?.profile?.projects?.length || profile?.projects?.length || 0} projects</strong>
            </div>
            <div className="activity-item">
              <span>Experience</span>
              <strong>{profile?.profile?.experience?.length || profile?.experience?.length || 0} entries</strong>
            </div>
            <div className="activity-item">
              <span>Education</span>
              <strong>{profile?.profile?.education?.length || profile?.education?.length || 0} entries</strong>
            </div>
            <div className="activity-item">
              <span>Certifications</span>
              <strong>{profile?.profile?.certifications?.length || profile?.certifications?.length || 0} certifications</strong>
            </div>
            <div className="activity-item">
              <span>Resume</span>
              <strong>{profile?.profile?.resume_text || profile?.resume_text ? 'Saved' : 'Not uploaded'}</strong>
            </div>
          </div>
          <div style={{ marginTop: 15 }}>
            <a className="btn btn-secondary" href="/candidate-onboarding" style={{ fontSize: '14px' }}>
              Update Profile
            </a>
          </div>
        </Card>
      </div>

      {(profile?.profile?.resume_text || profile?.resume_text) && (
        <Card>
          <SectionHead title="Saved Resume" description="Your resume is saved in your profile. You don't need to upload it again." />
          <div style={{
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            maxHeight: '300px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#d1d5db'
          }}>
            {profile?.profile?.resume_text || profile?.resume_text}
          </div>
        </Card>
      )}

      <Card>
        <SectionHead title="Detailed Profile Information" description="All your profile details." />
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <h4 style={{ marginBottom: '10px', color: '#a5b4fc' }}>Skills</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(profile?.profile?.skills || profile?.skills || []).map((skill, index) => (
                <span key={index} className="pill">{skill}</span>
              ))}
            </div>
          </div>

          {(profile?.profile?.projects || profile?.projects || []).length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px', color: '#a5b4fc' }}>Projects</h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                {(profile?.profile?.projects || profile?.projects || []).map((project, index) => (
                  <div key={index} style={{ padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
                    <strong style={{ color: '#fff' }}>{project.name}</strong>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '5px' }}>{project.description}</p>
                    {project.tech && project.tech.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                        {project.tech.map((tech, i) => (
                          <span key={i} className="pill" style={{ fontSize: '12px' }}>{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(profile?.profile?.experience || profile?.experience || []).length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px', color: '#a5b4fc' }}>Experience</h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                {(profile?.profile?.experience || profile?.experience || []).map((exp, index) => (
                  <div key={index} style={{ padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
                    <strong style={{ color: '#fff' }}>{exp.role}</strong>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '5px' }}>{exp.company}</p>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>{exp.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(profile?.profile?.education || profile?.education || []).length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px', color: '#a5b4fc' }}>Education</h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                {(profile?.profile?.education || profile?.education || []).map((edu, index) => (
                  <div key={index} style={{ padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
                    <strong style={{ color: '#fff' }}>{edu.degree}</strong>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '5px' }}>{edu.institution}</p>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(profile?.profile?.certifications || profile?.certifications || []).length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px', color: '#a5b4fc' }}>Certifications</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(profile?.profile?.certifications || profile?.certifications || []).map((cert, index) => (
                  <span key={index} className="pill">{cert}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  )
}
