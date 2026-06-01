import { useEffect, useState } from 'react'
import { BrainCircuit, CalendarCheck, CheckCircle2, Lightbulb, Target, Loader2 } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'
import { getCandidateReport } from '../services/analytics'

export default function CareerCoach() {
  const [coachData, setCoachData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const data = await getCandidateReport()
        setCoachData(data)
      } catch (error) {
        console.error('Failed to fetch coach data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCoachData()
  }, [])

  if (loading) {
    return (
      <AppShell title="Career Coach" description="Generating your personalized AI coaching plan...">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <Loader2 className="spinner" size={48} color="#8b5cf6" />
          <p style={{ color: '#94a3b8' }}>Consulting with your AI Career Coach...</p>
        </div>
      </AppShell>
    )
  }

  if (!coachData) {
    return (
      <AppShell title="Career Coach" description="Personalized AI coaching plan based on your resume, interviews, and target roles.">
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Not enough data to generate a coaching plan. Please complete an interview first.
          </div>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell title="Career Coach" description="Personalized AI coaching plan based on your resume, interviews, and target roles.">
      <div className="three-col">
        <Card>
          <BrainCircuit color="#a5b4fc" />
          <h3>AI Focus Area</h3>
          <p>{coachData.ai_focus_area}</p>
        </Card>
        <Card>
          <Target color="#38bdf8" />
          <h3>Target Role</h3>
          <p>{coachData.target_role}</p>
        </Card>
        <Card>
          <CheckCircle2 color="#22c55e" />
          <h3>Readiness Goal</h3>
          <p>{coachData.readiness_goal}</p>
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionHead title="AI Career Roadmap" description="A focused three-week improvement plan." />
          <div className="activity-list">
            {coachData.roadmap.map((item) => (
              <div className="activity-item" key={item.week}>
                <div>
                  <strong>{item.week}</strong>
                  <p className="muted" style={{ margin: '4px 0 0' }}>{item.focus}</p>
                </div>
                <CalendarCheck size={18} color="#a5b4fc" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHead title="Coach Recommendations" description="Practical actions to work on next." />
          <div className="activity-list">
            {coachData.recommendations.map((item) => (
              <div className="activity-item" key={item}>
                <span>{item}</span>
                <Lightbulb size={18} color="#f59e0b" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
