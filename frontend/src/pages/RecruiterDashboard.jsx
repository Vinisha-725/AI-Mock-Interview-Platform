import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ServerCog, UsersRound, Video } from 'lucide-react'
import { AppShell, Card, SectionHead, StatCard } from '../components/PremiumUI'
import { platformUsage, recentInterviews } from '../data/mockData'

export default function RecruiterDashboard() {
  return (
    <AppShell title="Admin Dashboard" description="Monitor platform usage, active interviews, readiness quality, and system health.">
      <div className="dashboard-grid">
        <StatCard icon={UsersRound} label="Total Users" value="2,418" change="+18% this month" tone="#38bdf8" />
        <StatCard icon={Video} label="Active Interviews" value="128" change="32 live now" tone="#8b5cf6" />
        <StatCard icon={Activity} label="Avg Readiness" value="79%" change="+6% this month" tone="#22c55e" />
        <StatCard icon={ServerCog} label="System Health" value="99.9%" change="All services normal" tone="#f59e0b" />
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="Platform Usage" description="Daily active users and interview sessions." />
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={platformUsage}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Line dataKey="users" stroke="#38bdf8" strokeWidth={3} />
              <Line dataKey="interviews" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <SectionHead title="Interview Statistics" description="Completed sessions by day." />
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={platformUsage}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Bar dataKey="interviews" fill="#6366f1" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="table-card">
        <SectionHead title="Recent Interviews" description="Latest candidate sessions and readiness status." />
        <table className="data-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Role</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentInterviews.map((row) => (
              <tr key={row.candidate}>
                <td>{row.candidate}</td>
                <td>{row.role}</td>
                <td>{row.score}</td>
                <td><span className="pill">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  )
}
