import { Bell, Building2, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'

export default function RecruiterSettings() {
  return (
    <AppShell variant="recruiter" title="Recruiter Settings" description="Manage recruiter profile, hiring notifications, and company preferences.">
      <div className="three-col">
        <Card>
          <UserRound color="#a5b4fc" />
          <h3>Recruiter Profile</h3>
          <div className="activity-list">
            <div className="activity-item"><span>Name</span><strong>Vinisha Recruiter</strong></div>
            <div className="activity-item"><span>Role</span><strong>Talent Partner</strong></div>
            <div className="activity-item"><span>Email</span><strong>recruiter@hiresense.ai</strong></div>
          </div>
        </Card>
        <Card>
          <Building2 color="#38bdf8" />
          <h3>Company Preferences</h3>
          <div className="activity-list">
            <div className="activity-item"><span>Company</span><strong>HireSense AI Demo</strong></div>
            <div className="activity-item"><span>Hiring Focus</span><strong>Engineering</strong></div>
            <div className="activity-item"><span>Readiness Threshold</span><strong>80%</strong></div>
          </div>
        </Card>
        <Card>
          <ShieldCheck color="#22c55e" />
          <h3>Access Control</h3>
          <p>Recruiter permissions and candidate data visibility are ready for backend integration.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Status</span>
            <span className="pill">Admin Demo</span>
          </div>
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionHead title="Notification Settings" description="Choose which hiring events should notify the recruiter team." />
          <div className="activity-list">
            {[
              'New candidate added to pipeline',
              'Candidate readiness crosses hiring threshold',
              'Interview completed and report generated',
              'Shortlisted candidate needs final review',
            ].map((item) => (
              <div className="activity-item" key={item}>
                <span>{item}</span>
                <Bell size={18} color="#f59e0b" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHead title="Company Preferences" description="Defaults used by AI hiring recommendations." />
          <div className="activity-list">
            <div className="activity-item"><span>Default target score</span><span className="pill">80%</span></div>
            <div className="activity-item"><span>Preferred final stage</span><span className="pill">Final Interview</span></div>
            <div className="activity-item"><span>Report delivery</span><span className="pill"><Mail size={14} /> Email</span></div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 18 }}>
            <Save size={18} />
            Save Preferences
          </button>
        </Card>
      </div>
    </AppShell>
  )
}
