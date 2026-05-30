import { useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Brain, Eye, MessageSquareText, ShieldCheck, Zap } from 'lucide-react'
import { AppShell, Card, MetricCard, RecommendationBadge, SectionHead } from '../components/PremiumUI'
import { recruiterCandidates } from '../data/mockData'

export default function RecruiterReport() {
  const { id } = useParams()
  const candidate = recruiterCandidates.find((item) => item.id === id) || recruiterCandidates[0]
  const scores = [
    { metric: 'Technical', score: candidate.interviewScore + 2 },
    { metric: 'Communication', score: candidate.interviewScore - 4 },
    { metric: 'Problem Solving', score: candidate.interviewScore },
    { metric: 'Confidence', score: candidate.interviewScore - 1 },
    { metric: 'Attention', score: candidate.interviewScore - 6 },
  ]

  return (
    <AppShell variant="recruiter" title={`${candidate.name} AI Interview Report`} description="Recruiter-facing interview analytics, AI reasoning, and hiring recommendation.">
      <div className="metric-grid">
        <MetricCard icon={Zap} label="Technical Score" value={scores[0].score} />
        <MetricCard icon={MessageSquareText} label="Communication" value={scores[1].score} />
        <MetricCard icon={Brain} label="Problem Solving" value={scores[2].score} />
        <MetricCard icon={ShieldCheck} label="Confidence" value={scores[3].score} />
        <MetricCard icon={Eye} label="Attention" value={scores[4].score} />
      </div>

      <div className="two-col">
        <Card className="chart-card">
          <SectionHead title="AI Interview Report" description="Score balance across evaluated traits." />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={scores}>
              <PolarGrid stroke="rgba(148,163,184,.22)" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.28} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <SectionHead title="Candidate Performance Trends" description="Interview dimension scores." />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scores}>
              <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
              <XAxis dataKey="metric" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(148,163,184,.2)', borderRadius: 14 }} />
              <Bar dataKey="score" fill="#38bdf8" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="three-col">
        <Card>
          <SectionHead title="Strengths" />
          <div className="activity-list">
            {candidate.skills.slice(0, 2).map((skill) => <div className="activity-item" key={skill}>Strong {skill} Skills</div>)}
            <div className="activity-item">Excellent Communication</div>
          </div>
        </Card>
        <Card>
          <SectionHead title="Weaknesses" />
          <div className="activity-list">
            {candidate.gaps.map((gap) => <div className="activity-item" key={gap}>Limited {gap} Knowledge</div>)}
          </div>
        </Card>
        <Card>
          <SectionHead title="AI Hiring Recommendation" />
          <RecommendationBadge value={candidate.recommendation} />
          <p style={{ marginTop: 16 }}>{candidate.reasoning}</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Recommendation</span>
            <strong>{candidate.recommendation === 'Recommended for Hiring' ? 'Proceed to Final Interview Round' : 'Schedule Follow-up Review'}</strong>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
