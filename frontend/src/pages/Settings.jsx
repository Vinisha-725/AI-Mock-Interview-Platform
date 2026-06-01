import { useEffect, useState } from 'react'
import { Bell, KeyRound, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'
import api from '../services/api'

export default function Settings() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  
  // Local preferences state
  const [prefs, setPrefs] = useState({
    difficulty: 'Medium',
    depth: 'Standard',
    timer: '45 Minutes',
    alerts: true,
    sync: true
  })

  // Profile edit state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    target_role: ''
  })

  useEffect(() => {
    // Load local prefs
    const localPrefs = localStorage.getItem('hiresense_prefs')
    if (localPrefs) {
      try {
        setPrefs(JSON.parse(localPrefs))
      } catch (e) {}
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/candidate/profile')
        const data = response.data
        setProfile(data)
        setFormData({
          full_name: data?.full_name || '',
          email: data?.email || '',
          target_role: data?.profile?.target_role || data?.target_role || ''
        })
      } catch (error) {
        console.error('Failed to fetch profile in settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handlePrefChange = (key, value) => {
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)
    localStorage.setItem('hiresense_prefs', JSON.stringify(newPrefs))
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setSavedMessage('')
    try {
      await api.put('/auth/candidate/profile', formData)
      setSavedMessage('Profile saved successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setSavedMessage('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="Settings" description="Manage your profile and preferences.">
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading settings...</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Settings" description="Manage your profile, interview preferences, notifications, and account security.">
      <div className="settings-page">
      {/* Top Cards for quick toggles */}
      <div className="dashboard-grid">
        <Card>
          <Bell color="#f59e0b" />
          <h3>Smart Alerts</h3>
          <p>Receive reminders when your readiness score needs attention.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Alerts</span>
            <button 
              className={`toggle-btn ${prefs.alerts ? 'active' : ''}`}
              onClick={() => handlePrefChange('alerts', !prefs.alerts)}
              style={{ background: prefs.alerts ? '#8b5cf6' : '#374151', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: 12, cursor: 'pointer' }}
            >
              {prefs.alerts ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </Card>
        <Card>
          <Save color="#22c55e" />
          <h3>Autosave</h3>
          <p>Your resume analysis and reports are saved automatically.</p>
          <div className="activity-item" style={{ marginTop: 18 }}>
            <span>Sync</span>
            <button 
              className={`toggle-btn ${prefs.sync ? 'active' : ''}`}
              onClick={() => handlePrefChange('sync', !prefs.sync)}
              style={{ background: prefs.sync ? '#22c55e' : '#374151', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: 12, cursor: 'pointer' }}
            >
              {prefs.sync ? 'Active' : 'Paused'}
            </button>
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
      </div>

      <div className="two-col">
        {/* Profile Form */}
        <Card>
          <SectionHead title="Profile Information" description="Update your personal details and target role." />
          <div className="settings-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="settings-label">Full Name</label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name}
                onChange={handleFormChange}
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label className="settings-label">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label className="settings-label">Target Role</label>
              <input 
                type="text" 
                name="target_role"
                value={formData.target_role}
                onChange={handleFormChange}
                placeholder="e.g. Frontend Engineer"
                className="settings-input"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <button 
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
              >
                {saving ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
                Save Profile
              </button>
              {savedMessage && (
                <span style={{ color: savedMessage.includes('Failed') ? '#ef4444' : '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {!savedMessage.includes('Failed') && <CheckCircle2 size={16} />}
                  {savedMessage}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Interview Preferences */}
        <Card>
          <SectionHead title="Interview Preferences" description="Configure defaults for your interview workspace." />
          <div className="settings-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="settings-label">Default Difficulty</label>
              <select 
                value={prefs.difficulty}
                onChange={(e) => handlePrefChange('difficulty', e.target.value)}
                className="settings-input"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="settings-label">Follow-up Depth</label>
              <select 
                value={prefs.depth}
                onChange={(e) => handlePrefChange('depth', e.target.value)}
                className="settings-input"
              >
                <option>Light (1-2 questions)</option>
                <option>Standard (2-3 questions)</option>
                <option>Deep Dive (3+ questions)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="settings-label">Timer Duration</label>
              <select 
                value={prefs.timer}
                onChange={(e) => handlePrefChange('timer', e.target.value)}
                className="settings-input"
              >
                <option>30 Minutes</option>
                <option>45 Minutes</option>
                <option>60 Minutes</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </AppShell>
  )
}
