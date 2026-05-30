import { BrainCircuit, CalendarCheck, CheckCircle2, Lightbulb, Target } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'

const roadmap = [
  { week: 'Week 1', focus: 'Strengthen resume keywords and project impact bullets' },
  { week: 'Week 2', focus: 'Practice React, APIs, and system design fundamentals' },
  { week: 'Week 3', focus: 'Run timed mock interviews and tighten communication' },
]

export default function CareerCoach() {
  return (
    <AppShell title="Career Coach" description="Personalized AI coaching plan based on your resume, interviews, and target roles.">
      <div className="three-col">
        <Card>
          <BrainCircuit color="#a5b4fc" />
          <h3>AI Focus Area</h3>
          <p>Improve answer structure with clearer problem, action, result framing.</p>
        </Card>
        <Card>
          <Target color="#38bdf8" />
          <h3>Target Role</h3>
          <p>Frontend Engineer with full-stack project experience.</p>
        </Card>
        <Card>
          <CheckCircle2 color="#22c55e" />
          <h3>Readiness Goal</h3>
          <p>Reach 90% readiness before your next interview cycle.</p>
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionHead title="AI Career Roadmap" description="A focused three-week improvement plan." />
          <div className="activity-list">
            {roadmap.map((item) => (
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
            {[
              'Record one 10-minute answer and review filler words.',
              'Add metrics to at least two resume project bullets.',
              'Practice one architecture tradeoff question daily.',
            ].map((item) => (
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
