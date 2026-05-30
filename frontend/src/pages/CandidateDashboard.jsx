import { useState, useEffect } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BriefcaseBusiness, CheckCircle2, Clock3, Gauge, Target } from 'lucide-react'
import { ActivityList, AppShell, Card, SectionHead, StatCard } from '../components/PremiumUI'
import { getHistory } from '../services/interview'

export default function CandidateDashboard() {
  const [sessionHistory, setSessionHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    totalDuration: 0,
    completedThisWeek: 0
  })

  useEffect(() => {
    fetchSessionHistory()
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

  // Generate skill growth data (placeholder - would need actual skill tracking)
  const skillGrowth = [
    { skill: 'Technical', current: stats.averageScore, target: 85 },
    { skill: 'Communication', current: Math.max(stats.averageScore - 10, 50), target: 80 },
    { skill: 'Problem Solving', current: Math.max(stats.averageScore - 5, 55), target: 85 },
    { skill: 'System Design', current: Math.max(stats.averageScore - 15, 40), target: 75 },
  ]

  if (loading) {
    return (
      <AppShell title="Candidate Dashboard" description="Track your interview readiness, resume alignment, and weekly skill growth.">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p>Loading your dashboard...</p>
        </div>
      </AppShell>
    )
  }

  const completedThisWeekText = stats.completedThisWeek > 0 ? `${stats.completedThisWeek} this week` : 'No interviews this week'

  return (
    <AppShell title="Candidate Dashboard" description="Track your interview readiness, resume alignment, and weekly skill growth.">
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
      </div>
    </AppShell>
  )
}
