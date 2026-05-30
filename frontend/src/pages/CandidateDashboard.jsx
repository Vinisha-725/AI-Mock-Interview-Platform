import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BriefcaseBusiness, CheckCircle2, Clock3, Gauge, Target } from 'lucide-react'
import { ActivityList, AppShell, Card, SectionHead, StatCard } from '../components/PremiumUI'
import { readinessTrend, recentActivity, skillGrowth } from '../data/mockData'

export default function CandidateDashboard() {
  return (
    <AppShell title="Candidate Dashboard" description="Track your interview readiness, resume alignment, and weekly skill growth.">
      <div className="dashboard-grid">
        <StatCard icon={Gauge} label="Hiring Readiness" value="86%" change="+12% from last week" tone="#8b5cf6" />
        <StatCard icon={Target} label="Resume Match" value="78%" change="+9% after AI suggestions" tone="#38bdf8" />
        <StatCard icon={CheckCircle2} label="Interviews Completed" value="14" change="4 this week" tone="#22c55e" />
        <StatCard icon={Clock3} label="Practice Time" value="8.5h" change="+2.1h this week" tone="#f59e0b" />
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="Progress Graph" description="Readiness and confidence trend over the last six sessions." />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={readinessTrend}>
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
          <SectionHead title="Recent Activity" description="Latest AI coaching events." />
          <ActivityList items={recentActivity} />
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
          <p>Upload the latest job description and run a focused system design mock interview for stronger role alignment.</p>
          <div style={{ marginTop: 20 }}>
            <a className="btn btn-primary" href="/resume-upload">Analyze JD</a>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
