import { BriefcaseBusiness, Building2, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('hiresense_user') || 'null') || {
    name: 'Demo User',
    email: 'demo@hiresense.ai',
    role: 'candidate',
  }
  const isRecruiter = user.role === 'recruiter'

  return (
    <AppShell
      variant={isRecruiter ? 'recruiter' : 'candidate'}
      title="Profile"
      description={isRecruiter ? 'Recruiter workspace identity and company details.' : 'Candidate account details and interview profile.'}
    >
      <div className="profile-hero glass">
        <div className="profile-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div>
          <h2>{user.name || 'Demo User'}</h2>
          <p>{user.email}</p>
          <span className="pill">{isRecruiter ? 'Recruiter / Admin' : 'Candidate'}</span>
        </div>
      </div>

      <div className="three-col">
        <Card>
          <UserRound color="#a5b4fc" />
          <h3>Account Information</h3>
          <div className="activity-list">
            <div className="activity-item"><span>Name</span><strong>{user.name || 'Demo User'}</strong></div>
            <div className="activity-item"><span>Email</span><strong>{user.email}</strong></div>
            <div className="activity-item"><span>Role</span><strong>{isRecruiter ? 'Recruiter' : 'Candidate'}</strong></div>
          </div>
        </Card>

        {isRecruiter ? (
          <Card>
            <Building2 color="#38bdf8" />
            <h3>Recruiter Details</h3>
            <div className="activity-list">
              <div className="activity-item"><span>Company</span><strong>{user.company || 'Not set'}</strong></div>
              <div className="activity-item"><span>Title</span><strong>{user.recruiterTitle || 'Recruiter'}</strong></div>
              <div className="activity-item"><span>Hiring Focus</span><strong>{user.hiringFocus || 'General hiring'}</strong></div>
            </div>
          </Card>
        ) : (
          <Card>
            <BriefcaseBusiness color="#38bdf8" />
            <h3>Candidate Details</h3>
            <div className="activity-list">
              <div className="activity-item"><span>Target Role</span><strong>Frontend Engineer</strong></div>
              <div className="activity-item"><span>Readiness</span><strong>86%</strong></div>
              <div className="activity-item"><span>Resume Match</span><strong>78%</strong></div>
            </div>
          </Card>
        )}

        <Card>
          <ShieldCheck color="#22c55e" />
          <h3>Session</h3>
          <p>This is a dummy local session. Backend user database integration can replace this later.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <Mail size={18} color="#a5b4fc" />
            <span>{user.signedInAt ? `Signed in ${new Date(user.signedInAt).toLocaleString()}` : 'Demo session active'}</span>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead title="Profile Actions" description="Quick links for this account type." />
        <div className="actions" style={{ flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href={isRecruiter ? '/admin' : '/candidate-dashboard'}>{isRecruiter ? 'Open Recruiter Dashboard' : 'Open Candidate Dashboard'}</a>
          <a className="btn btn-ghost" href={isRecruiter ? '/recruiter-settings' : '/settings'}>Account Settings</a>
        </div>
      </Card>
    </AppShell>
  )
}
