import { Area, AreaChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Brain, MessageSquareText, ShieldCheck, Timer, Zap } from 'lucide-react'
import { AppShell, Card, MetricCard, ScoreRing, SectionHead } from '../components/PremiumUI'
import { radarMetrics, readinessTrend } from '../data/mockData'

export default function Report() {
  return (
    <AppShell title="Interview Report" description="A clear readiness report with strengths, risks, and a practical AI career roadmap.">
      <div className="report-hero">
        <Card>
          <ScoreRing score={86} label="Interview Ready" />
        </Card>
        <div className="metric-grid">
          <MetricCard icon={Zap} label="Technical Score" value="88" />
          <MetricCard icon={MessageSquareText} label="Communication" value="79" />
          <MetricCard icon={ShieldCheck} label="Confidence" value="82" />
          <MetricCard icon={Brain} label="Attention" value="74" />
          <MetricCard icon={Timer} label="Time Management" value="91" />
        </div>
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="Radar Chart" description="Competency balance across the interview." />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarMetrics}>
              <PolarGrid stroke="rgba(148,163,184,.22)" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.28} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <SectionHead title="Performance Trend" description="Readiness growth from recent practice sessions." />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={readinessTrend}>
              <Area type="monotone" dataKey="score" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} strokeWidth={3} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="three-col">
        <Card>
          <SectionHead title="Strengths" />
          <div className="activity-list">
            {['Clear project ownership', 'Strong React fundamentals', 'Good debugging narrative'].map((item) => <div className="activity-item" key={item}>{item}</div>)}
          </div>
        </Card>
        <Card>
          <SectionHead title="Weaknesses" />
          <div className="activity-list">
            {['Needs sharper system design tradeoffs', 'Add more metrics to answers', 'Reduce filler words'].map((item) => <div className="activity-item" key={item}>{item}</div>)}
          </div>
        </Card>
        <Card>
          <SectionHead title="AI Career Roadmap" />
          <div className="activity-list">
            {['Week 1: System design basics', 'Week 2: Behavioral STAR answers', 'Week 3: Timed mock interviews'].map((item) => <div className="activity-item" key={item}>{item}</div>)}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
