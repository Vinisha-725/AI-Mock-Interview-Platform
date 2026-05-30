import { Bell, KeyRound, Moon, Save, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'

const settingsGroups = [
  {
    title: 'Profile',
    icon: UserRound,
    items: ['Candidate name', 'Target role', 'Preferred interview level'],
  },
  {
    title: 'Interview Preferences',
    icon: SlidersHorizontal,
    items: ['Question difficulty', 'Follow-up depth', 'Timer duration'],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: ['Weekly readiness report', 'Practice reminders', 'Career roadmap alerts'],
  },
  {
    title: 'Security',
    icon: ShieldCheck,
    items: ['Two-factor authentication', 'Session management', 'Data export'],
  },
]

export default function Settings() {
  return (
    <AppShell title="Settings" description="Manage your profile, interview preferences, notifications, and account security.">
      <div className="dashboard-grid">
        <Card>
          <Moon color="#a5b4fc" />
          <h3>Appearance</h3>
          <p>Dark premium theme is enabled for HireSense AI.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Theme</span>
            <span className="pill">Dark</span>
          </div>
        </Card>
        <Card>
          <KeyRound color="#38bdf8" />
          <h3>Account Access</h3>
          <p>Control login sessions and authentication options.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Status</span>
            <span className="pill">Secure</span>
          </div>
        </Card>
        <Card>
          <Bell color="#f59e0b" />
          <h3>Smart Alerts</h3>
          <p>Receive reminders when your readiness score needs attention.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Alerts</span>
            <span className="pill">Enabled</span>
          </div>
        </Card>
        <Card>
          <Save color="#22c55e" />
          <h3>Autosave</h3>
          <p>Your resume analysis and reports are saved automatically.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Sync</span>
            <span className="pill">Active</span>
          </div>
        </Card>
      </div>

      <div className="two-col">
        {settingsGroups.map((group) => {
          const Icon = group.icon
          return (
            <Card key={group.title}>
              <SectionHead title={group.title} description="Configure defaults for your interview workspace." />
              <div className="activity-list">
                {group.items.map((item) => (
                  <div className="activity-item" key={item}>
                    <span>{item}</span>
                    <Icon size={18} color="#a5b4fc" />
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </AppShell>
  )
}
