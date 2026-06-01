import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, GraduationCap, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'
import api from '../services/api'

export default function CandidateOnboarding() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    target_role: '',
    skills: [],
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    resume_text: ''
  })

  const [newSkill, setNewSkill] = useState('')
  const [newProject, setNewProject] = useState({ name: '', description: '', tech: [] })
  const [newProjectTech, setNewProjectTech] = useState('')
  const [newExperience, setNewExperience] = useState({ company: '', role: '', duration: '' })
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' })
  const [newCertification, setNewCertification] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/candidate/profile')
      if (response.data.profile) {
        setProfile({
          full_name: response.data.full_name || '',
          email: response.data.email || '',
          target_role: response.data.profile.target_role || '',
          skills: response.data.profile.skills || [],
          projects: response.data.profile.projects || [],
          experience: response.data.profile.experience || [],
          education: response.data.profile.education || [],
          certifications: response.data.profile.certifications || [],
          resume_text: response.data.profile.resume_text || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Send all profile data including email
      const profileData = {
        full_name: profile.full_name,
        email: profile.email,
        target_role: profile.target_role,
        resume_text: profile.resume_text,
        skills: profile.skills,
        projects: profile.projects,
        experience: profile.experience,
        education: profile.education,
        certifications: profile.certifications
      }
      await api.put('/auth/candidate/profile', profileData)
      navigate('/candidate-dashboard')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] })
      setNewSkill('')
    }
  }

  const removeSkill = (index) => {
    setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== index) })
  }

  const addProject = () => {
    if (newProject.name && newProject.description) {
      setProfile({
        ...profile,
        projects: [...profile.projects, { ...newProject, tech: newProject.tech.filter(t => t.trim()) }]
      })
      setNewProject({ name: '', description: '', tech: [] })
      setNewProjectTech('')
    }
  }

  const removeProject = (index) => {
    setProfile({ ...profile, projects: profile.projects.filter((_, i) => i !== index) })
  }

  const addProjectTech = () => {
    if (newProjectTech.trim()) {
      setNewProject({ ...newProject, tech: [...newProject.tech, newProjectTech.trim()] })
      setNewProjectTech('')
    }
  }

  const removeProjectTech = (index) => {
    setNewProject({ ...newProject, tech: newProject.tech.filter((_, i) => i !== index) })
  }

  const addExperience = () => {
    if (newExperience.company && newExperience.role) {
      setProfile({ ...profile, experience: [...profile.experience, newExperience] })
      setNewExperience({ company: '', role: '', duration: '' })
    }
  }

  const removeExperience = (index) => {
    setProfile({ ...profile, experience: profile.experience.filter((_, i) => i !== index) })
  }

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setProfile({ ...profile, education: [...profile.education, newEducation] })
      setNewEducation({ degree: '', institution: '', year: '' })
    }
  }

  const removeEducation = (index) => {
    setProfile({ ...profile, education: profile.education.filter((_, i) => i !== index) })
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfile({ ...profile, certifications: [...profile.certifications, newCertification.trim()] })
      setNewCertification('')
    }
  }

  const removeCertification = (index) => {
    setProfile({ ...profile, certifications: profile.certifications.filter((_, i) => i !== index) })
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post('/auth/candidate/parse-resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.data.success && response.data.data) {
          const parsed = response.data.data

          // Auto-populate profile with parsed data
          setProfile({
            full_name: parsed.full_name || profile.full_name,
            email: parsed.email || profile.email,
            target_role: parsed.target_role || profile.target_role,
            skills: parsed.skills || profile.skills,
            projects: parsed.projects || profile.projects,
            experience: parsed.experience || profile.experience,
            education: parsed.education || profile.education,
            certifications: parsed.certifications || profile.certifications,
            resume_text: parsed.resume_text || profile.resume_text
          })

          alert('Resume parsed successfully! Please review and edit the extracted information as needed.')
        }
      } catch (error) {
        console.error('Failed to parse resume:', error)
        alert('Failed to parse resume. Please try again or enter your details manually.')

        // Fallback: just read the file as text
        const reader = new FileReader()
        reader.onload = (event) => {
          setProfile({ ...profile, resume_text: event.target.result })
        }
        reader.readAsText(file)
      }
    }
  }

  return (
    <AppShell title="Complete Your Profile" description="Tell us about yourself to get personalized interview recommendations.">
      <Card>
        <SectionHead title="Upload Resume" description="Upload your resume to automatically extract your profile details. You can edit the extracted information as needed." />
        <div style={{ padding: '20px', backgroundColor: '#1f2937', borderRadius: '8px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
            <label className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Upload size={18} />
              <span>Upload Resume (PDF, DOCX, TXT)</span>
              <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
            </label>
            {profile.resume_text && <span className="pill" style={{ color: '#22c55e' }}>Resume uploaded and parsed</span>}
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            We'll automatically extract your name, email, target role, skills, projects, experience, education, and certifications from your resume.
            You can review and edit all extracted information before saving.
          </p>
        </div>
        {profile.resume_text && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Resume Text (editable)</label>
            <textarea
              value={profile.resume_text}
              onChange={(e) => setProfile({ ...profile, resume_text: e.target.value })}
              placeholder="Your resume text will appear here after upload..."
              rows={8}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff', fontFamily: 'monospace' }}
            />
          </div>
        )}
      </Card>

      <Card>
        <SectionHead title="Basic Information" description="Your contact details and target role." />
        <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Enter your email"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Target Role</label>
            <input
              type="text"
              value={profile.target_role}
              onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
              placeholder="e.g., Software Engineer, Data Scientist"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHead title="Skills" description="Add your technical and professional skills." />
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Add a skill"
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <button onClick={addSkill} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {profile.skills.map((skill, index) => (
            <span key={index} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {skill}
              <button onClick={() => removeSkill(index)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0' }}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead title="Projects" description="Add your notable projects." />
        <div style={{ display: 'grid', gap: '15px', marginBottom: '20px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
          <input
            type="text"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Project name"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="Project description"
            rows={3}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newProjectTech}
              onChange={(e) => setNewProjectTech(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addProjectTech()}
              placeholder="Add technology"
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
            />
            <button onClick={addProjectTech} className="btn btn-secondary" style={{ padding: '10px 16px' }}>
              <Plus size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {newProject.tech.map((tech, index) => (
              <span key={index} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {tech}
                <button onClick={() => removeProjectTech(index)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <button onClick={addProject} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Plus size={18} /> Add Project
          </button>
        </div>
        <div style={{ display: 'grid', gap: '15px' }}>
          {profile.projects.map((project, index) => (
            <div key={index} style={{ padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '5px' }}>{project.name}</strong>
                <p style={{ color: '#9ca3af', marginBottom: '8px' }}>{project.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {project.tech.map((t, i) => (
                    <span key={i} className="pill" style={{ fontSize: '12px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => removeProject(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead title="Experience" description="Add your work experience." />
        <div style={{ display: 'grid', gap: '15px', marginBottom: '20px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
          <input
            type="text"
            value={newExperience.company}
            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
            placeholder="Company name"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <input
            type="text"
            value={newExperience.role}
            onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
            placeholder="Your role"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <input
            type="text"
            value={newExperience.duration}
            onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
            placeholder="Duration (e.g., 2 years, Jan 2020 - Present)"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <button onClick={addExperience} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Plus size={18} /> Add Experience
          </button>
        </div>
        <div style={{ display: 'grid', gap: '15px' }}>
          {profile.experience.map((exp, index) => (
            <div key={index} style={{ padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '5px' }}>{exp.company}</strong>
                <p style={{ color: '#9ca3af', marginBottom: '4px' }}>{exp.role}</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>{exp.duration}</p>
              </div>
              <button onClick={() => removeExperience(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead title="Education" description="Add your educational background." />
        <div style={{ display: 'grid', gap: '15px', marginBottom: '20px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
          <input
            type="text"
            value={newEducation.degree}
            onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            placeholder="Degree (e.g., B.Tech Computer Science)"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <input
            type="text"
            value={newEducation.institution}
            onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
            placeholder="Institution name"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <input
            type="text"
            value={newEducation.year}
            onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
            placeholder="Year of graduation"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <button onClick={addEducation} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <GraduationCap size={18} /> Add Education
          </button>
        </div>
        <div style={{ display: 'grid', gap: '15px' }}>
          {profile.education.map((edu, index) => (
            <div key={index} style={{ padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '5px' }}>{edu.degree}</strong>
                <p style={{ color: '#9ca3af', marginBottom: '4px' }}>{edu.institution}</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>{edu.year}</p>
              </div>
              <button onClick={() => removeEducation(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead title="Certifications" description="Add your professional certifications." />
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCertification()}
            placeholder="Add a certification"
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }}
          />
          <button onClick={addCertification} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {profile.certifications.map((cert, index) => (
            <span key={index} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {cert}
              <button onClick={() => removeCertification(index)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0' }}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
        <button onClick={() => navigate('/candidate-dashboard')} className="btn btn-secondary">
          Skip for Now
        </button>
        <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} />
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </AppShell>
  )
}
