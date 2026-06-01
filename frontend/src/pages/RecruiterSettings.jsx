import { useEffect, useState } from 'react'
import { Bell, Building2, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'
import api from '../services/api'

export default function RecruiterSettings() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ company_name: '', company_description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('hiresense_user') || 'null')
    if (storedUser) {
      setUser(storedUser)
      fetchProfile(storedUser.id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(`/recruiter/profile?user_id=${userId}`)
      if (response.data) {
        setProfile({
          company_name: response.data.company_name === 'EMPTY' ? '' : response.data.company_name || '',
          company_description: response.data.company_description === 'EMPTY' ? '' : response.data.company_description || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await api.put('/recruiter/profile', {
        user_id: user.id,
        company_name: profile.company_name,
        company_description: profile.company_description
      })
      setNotice('Profile updated successfully!')
      setTimeout(() => setNotice(''), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setNotice('Failed to update profile')
      setTimeout(() => setNotice(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell variant="recruiter" title="Recruiter Settings" description="Manage recruiter profile, hiring notifications, and company preferences.">
        <div style={{ textAlign: 'center', padding: '60px' }}><p>Loading settings...</p></div>
      </AppShell>
    )
  }

  return (
    <AppShell variant="recruiter" title="Recruiter Settings" description="Manage recruiter profile, hiring notifications, and company preferences.">
      {notice && <div className="inline-toast">{notice}</div>}
      <div className="three-col">
        <Card>
          <UserRound color="#a5b4fc" />
          <h3>Recruiter Profile</h3>
          <div className="activity-list">
            <div className="activity-item"><span>Name</span><strong>{user?.full_name || 'Admin'}</strong></div>
            <div className="activity-item"><span>Role</span><strong>Talent Partner</strong></div>
            <div className="activity-item"><span>Email</span><strong>{user?.email || 'admin@hiresense.ai'}</strong></div>
          </div>
        </Card>
        <Card>
          <Building2 color="#38bdf8" />
          <h3>Company Identity</h3>
          <div className="activity-list">
            <div className="activity-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <span>Company Name</span>
              <input 
                type="text" 
                value={profile.company_name} 
                onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                placeholder="e.g. HireSense AI"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
              />
            </div>
            <div className="activity-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <span>Company Description</span>
              <textarea 
                value={profile.company_description} 
                onChange={(e) => setProfile({...profile, company_description: e.target.value})}
                placeholder="Brief description of your company..."
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: 'white', resize: 'vertical' }}
              />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 18, width: '100%', justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
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
        </Card>
      </div>
    </AppShell>
  )
}
