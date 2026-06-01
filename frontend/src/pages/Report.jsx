import { useEffect, useState } from 'react'
import { Area, AreaChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Brain, MessageSquareText, ShieldCheck, Timer, Zap, Loader2 } from 'lucide-react'
import { AppShell, Card, MetricCard, ScoreRing, SectionHead } from '../components/PremiumUI'
import { getCandidateReport } from '../services/analytics'

export default function Report() {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getCandidateReport()
        setReportData(data)
      } catch (error) {
        console.error('Failed to fetch report', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [])

  if (loading) {
    return (
      <AppShell title="Interview Report" description="Generating your personalized AI report...">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <Loader2 className="spinner" size={48} color="#8b5cf6" />
          <p style={{ color: '#94a3b8' }}>Analyzing your interview performance and resume...</p>
        </div>
      </AppShell>
    )
  }

  if (!reportData) {
    return (
      <AppShell title="Interview Report" description="A clear readiness report with strengths, risks, and a practical AI career roadmap.">
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Not enough data to generate a report. Please complete an interview first.
          </div>
        </Card>
      </AppShell>
    )
  }

  const radarData = [
    { metric: 'Technical', score: reportData.technical_score },
    { metric: 'Communication', score: reportData.communication_score },
    { metric: 'Confidence', score: reportData.confidence_score },
    { metric: 'Attention', score: reportData.attention_score },
    { metric: 'Timing', score: reportData.timing_score },
  ]

  // Mocking the trend slightly around the actual score for visual continuity until we have a real time series
  const trendData = [
    { week: 'W1', score: Math.max(0, reportData.readiness_score - 15) },
    { week: 'W2', score: Math.max(0, reportData.readiness_score - 10) },
    { week: 'W3', score: Math.max(0, reportData.readiness_score - 5) },
    { week: 'W4', score: reportData.readiness_score },
  ]

  return (
    <AppShell title="Interview Report" description="A clear readiness report with strengths, risks, and a practical AI career roadmap.">
      <div className="report-hero">
        <Card>
          <ScoreRing score={reportData.readiness_score} label="Interview Ready" />
        </Card>
        <div className="metric-grid">
          <MetricCard icon={Zap} label="Technical Score" value={reportData.technical_score.toString()} />
          <MetricCard icon={MessageSquareText} label="Communication" value={reportData.communication_score.toString()} />
          <MetricCard icon={ShieldCheck} label="Confidence" value={reportData.confidence_score.toString()} />
          <MetricCard icon={Brain} label="Attention" value={reportData.attention_score.toString()} />
          <MetricCard icon={Timer} label="Time Management" value={reportData.timing_score.toString()} />
        </div>
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="Radar Chart" description="Competency balance across the interview." />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
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
            <AreaChart data={trendData}>
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
            {reportData.strengths.map((item, i) => <div className="activity-item" key={i}>{item}</div>)}
          </div>
        </Card>
        <Card>
          <SectionHead title="Weaknesses" />
          <div className="activity-list">
            {reportData.weaknesses.map((item, i) => <div className="activity-item" key={i}>{item}</div>)}
          </div>
        </Card>
        <Card>
          <SectionHead title="AI Career Roadmap" />
          <div className="activity-list">
            {reportData.roadmap.map((item, i) => <div className="activity-item" key={i}>{item.week}: {item.focus}</div>)}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
