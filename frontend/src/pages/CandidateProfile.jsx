import { useParams } from 'react-router-dom'
import { BriefcaseBusiness, FileText, History, Lightbulb, UserRound } from 'lucide-react'
import { AppShell, Card, PillList, RecommendationBadge, SectionHead } from '../components/PremiumUI'
import { recruiterCandidates } from '../data/mockData'

export default function CandidateProfile() {
  const { id } = useParams()
  const candidate = recruiterCandidates.find((item) => item.id === id) || recruiterCandidates[0]

  return (
    <AppShell
      variant="recruiter"
      title={candidate.name}
      description={`${candidate.targetRole} candidate profile, resume intelligence, interview history, and AI hiring recommendation.`}
    >
      <div className="three-col">
        <Card>
          <UserRound color="#a5b4fc" />
          <h3>Candidate Information</h3>
          <div className="activity-list">
            <div className="activity-item"><span>Target Role</span><strong>{candidate.targetRole}</strong></div>
            <div className="activity-item"><span>Experience</span><strong>{candidate.experience}</strong></div>
            <div className="activity-item"><span>Status</span><span className="pill">{candidate.status}</span></div>
          </div>
        </Card>
        <Card>
          <FileText color="#38bdf8" />
          <h3>Resume</h3>
          <p>Resume match score and extracted signals from candidate upload.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Resume Match</span>
            <span className="pill">{candidate.resumeMatch}%</span>
          </div>
        </Card>
        <Card>
          <Lightbulb color="#f59e0b" />
          <h3>Hiring Recommendation</h3>
          <RecommendationBadge value={candidate.recommendation} />
          <p style={{ marginTop: 14 }}>{candidate.reasoning}</p>
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionHead title="Skills Extracted" description="Detected technical and professional skills." />
          <PillList items={candidate.skills} />
        </Card>
        <Card>
          <SectionHead title="Skill Gaps" description="Areas to validate in the next interview round." />
          <PillList items={candidate.gaps} />
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionHead title="Projects" description="Projects surfaced from the candidate resume." />
          <div className="activity-list">
            {candidate.projects.map((project) => (
              <div className="activity-item" key={project}>
                <span>{project}</span>
                <BriefcaseBusiness size={18} color="#a5b4fc" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHead title="Interview History" description="Recent AI interview outcomes." />
          <div className="activity-list">
            <div className="activity-item"><span>Technical Round</span><span className="pill">{candidate.interviewScore}%</span></div>
            <div className="activity-item"><span>Communication Round</span><span className="pill">{Math.max(candidate.interviewScore - 5, 60)}%</span></div>
            <div className="activity-item"><span>Problem Solving Round</span><span className="pill">{Math.max(candidate.interviewScore - 2, 60)}%</span></div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead title="AI Evaluation Summary" description="Generated recruiter summary for profile review." />
        <div className="activity-item">
          <History size={18} color="#8b5cf6" />
          <span>{candidate.reasoning} Recommended next step: {candidate.recommendation === 'Recommended for Hiring' ? 'Proceed to Final Interview Round.' : 'Schedule a focused follow-up interview.'}</span>
        </div>
      </Card>
    </AppShell>
  )
}
