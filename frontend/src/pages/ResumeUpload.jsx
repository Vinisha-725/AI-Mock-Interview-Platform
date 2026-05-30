import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, BriefcaseBusiness, FileUp, Lightbulb, Sparkles, Wand2, FileText } from 'lucide-react'
import { AppShell, Card, PillList, ScoreRing, SectionHead, SkeletonRows } from '../components/PremiumUI'
import { uploadResume } from '../services/resume'

const commonRoleSkills = [
  'python',
  'sql',
  'java',
  'javascript',
  'html',
  'css',
  'react',
  'node.js',
  'mongodb',
  'tableau',
  'power bi',
  'pandas',
  'data cleaning',
  'data manipulation',
  'hypothesis testing',
  'matplotlib',
  'seaborn',
]

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9+#. ]/g, ' ').replace(/\s+/g, ' ').trim()

const calculateMatchScore = (resumeData, jdText) => {
  if (!resumeData) return 0

  const skills = [...new Set([...(resumeData.skills || []), ...(resumeData.techStack || [])])]
    .map(normalize)
    .filter(Boolean)

  if (!skills.length) return 0

  const jd = normalize(jdText || '')
  if (jd.length > 20) {
    const matched = skills.filter((skill) => jd.includes(skill) || skill.split(' ').some((part) => part.length > 3 && jd.includes(part)))
    return Math.min(98, Math.max(35, Math.round((matched.length / skills.length) * 100)))
  }

  const knownMatches = skills.filter((skill) => commonRoleSkills.some((target) => skill.includes(target) || target.includes(skill)))
  const breadthScore = Math.min(45, skills.length * 4)
  const relevanceScore = Math.min(45, knownMatches.length * 7)
  const profileScore = Math.min(10, (resumeData.projects?.length || 0) * 3 + (resumeData.experience?.length || 0) * 4)

  return Math.min(95, Math.max(45, breadthScore + relevanceScore + profileScore))
}

const getMissingSkills = (resumeData, jdText) => {
  if (!resumeData) return []

  const skills = [...new Set([...(resumeData.skills || []), ...(resumeData.techStack || [])])]
    .map(normalize)
    .filter(Boolean)
  const jd = normalize(jdText || '')

  if (jd.length > 20) {
    return commonRoleSkills
      .filter((skill) => jd.includes(skill) && !skills.some((detected) => detected.includes(skill) || skill.includes(detected)))
      .map((skill) => skill.replace(/\b\w/g, (char) => char.toUpperCase()))
      .slice(0, 8)
  }

  return commonRoleSkills
    .filter((skill) => !skills.some((detected) => detected.includes(skill) || skill.includes(detected)))
    .slice(0, 5)
    .map((skill) => skill.replace(/\b\w/g, (char) => char.toUpperCase()))
}

const generateSuggestions = (resumeData, missingSkills, matchScore, hasJdText) => {
  if (!resumeData) return []

  const suggestions = []

  if (!hasJdText) {
    suggestions.push('Paste the job description to calculate a more accurate resume-to-role match.')
  }

  if (missingSkills.length) {
    suggestions.push(`Consider adding relevant experience with ${missingSkills.slice(0, 3).join(', ')} if you have it.`)
  }

  if (!resumeData.projects?.length) {
    suggestions.push('Add 2-3 project bullets with your role, tech stack, and measurable outcomes.')
  }

  if (!resumeData.experience?.length) {
    suggestions.push('Include work experience or internships with action verbs and impact metrics.')
  }

  if ((resumeData.skills?.length || 0) > 12) {
    suggestions.push('Group skills into categories like Languages, Frameworks, Databases, and Tools for easier scanning.')
  }

  if (matchScore < 60) {
    suggestions.push('Tailor your resume keywords to the target role before applying.')
  }

  if (!suggestions.length) {
    suggestions.push('Your resume has a strong skills section. Add quantified impact to make it more recruiter-ready.')
  }

  return suggestions
}

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [jdFile, setJdFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [jdInputMode, setJdInputMode] = useState('file') // 'file' or 'text'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const activeJdText = jdInputMode === 'text' ? jdText : ''
  const backendScore = Number(data?.match_score)
  const matchScore = data && Number.isFinite(backendScore) && backendScore > 0
    ? backendScore
    : calculateMatchScore(data, activeJdText)
  const matchLabel = matchScore >= 75 ? 'Strong Match' : matchScore >= 55 ? 'Moderate Match' : 'Needs Improvement'
  const missingSkills = data?.missing_skills?.length ? data.missing_skills : getMissingSkills(data, activeJdText)
  const suggestions = data?.suggestions?.length
    ? data.suggestions
    : generateSuggestions(data, missingSkills, matchScore, activeJdText.trim().length > 20)
  const providerLabel = data?.ai_provider === 'ollama' ? 'Ollama' : data?.ai_provider === 'openai' ? 'OpenAI' : 'Local'

  const handleUpload = async () => {
    if (!file) {
      setError('Upload a PDF or DOCX resume first.')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await uploadResume(file, activeJdText, jdInputMode === 'file' ? jdFile : null)
      localStorage.setItem('hiresense_resume_context', JSON.stringify({
        skills: response.skills || [],
        projects: response.projects || [],
        jd_text: response.jd_text || activeJdText,
      }))
      setData(response)
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Resume analysis is taking too long. Try a smaller resume/JD, or switch Ollama to a faster model like llama3.2:3b.')
      } else {
        setError(err.response?.data?.detail || 'Resume analysis failed. Make sure the backend is running and the resume is a text-based PDF or DOCX.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Resume Analysis" description="Compare your resume with a target role and get AI suggestions that sharpen your profile.">
      <div className="two-col">
        <div className="upload-card glass">
          <SectionHead title="Upload Resume" description="Drag and drop a text-based PDF or DOCX resume." />
          <label className="upload-zone">
            <input type="file" accept=".pdf,.docx" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <div>
              <FileUp size={42} color="#a5b4fc" />
              <h3>{file ? file.name : 'Drag and drop resume'}</h3>
              <p>PDF and DOCX supported</p>
            </div>
          </label>
          <div style={{ height: 14 }} />
          <div className="jd-input-section">
            <div className="jd-toggle">
              <button 
                className={`toggle-btn ${jdInputMode === 'file' ? 'active' : ''}`}
                onClick={() => setJdInputMode('file')}
              >
                <FileUp size={16} />
                Upload File
              </button>
              <button 
                className={`toggle-btn ${jdInputMode === 'text' ? 'active' : ''}`}
                onClick={() => setJdInputMode('text')}
              >
                <FileText size={16} />
                Enter Text
              </button>
            </div>
            
            {jdInputMode === 'file' ? (
              <label className="upload-zone" style={{ minHeight: 170 }}>
                <input type="file" accept=".pdf,.docx,.txt" onChange={(event) => setJdFile(event.target.files?.[0] || null)} />
                <div>
                  <BriefcaseBusiness size={34} color="#38bdf8" />
                  <h3>{jdFile ? jdFile.name : 'Upload JD'}</h3>
                  <p>Optional role description for match scoring</p>
                </div>
              </label>
            ) : (
              <div className="text-input-zone">
                <textarea
                  placeholder="Paste job description text here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="jd-textarea"
                />
                <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                  {jdText.length} characters
                </p>
              </div>
            )}
          </div>
          {error && (
            <div className="activity-item" style={{ marginTop: 14, color: '#fecdd3' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleUpload} disabled={loading}>
            <Wand2 size={18} />
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>

        <Card>
          <SectionHead
            title="AI Suggestions"
            description={['openai', 'ollama'].includes(data?.ai_provider) ? 'Generated by AI using your resume and job description.' : 'High-impact changes to improve recruiter and ATS alignment.'}
          />
          {data ? (
            <div className="activity-list">
              {suggestions.map((item, index) => (
                <div className="activity-item" key={index}>
                  <span>{item}</span>
                  <Lightbulb size={18} color="#f59e0b" />
                </div>
              ))}
            </div>
          ) : (
            <div className="activity-list">
              <div className="activity-item">
                <span className="muted">Upload your resume to get AI-powered suggestions.</span>
                <Lightbulb size={18} color="#f59e0b" />
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="result-grid">
        <Card>
          <SectionHead
            title="Match Percentage"
            description={data ? `${providerLabel} match analysis from extracted resume signals.` : 'Upload your resume to see match score.'}
          />
          {loading ? <SkeletonRows /> : <ScoreRing score={matchScore} label={matchLabel} />}
        </Card>

        <Card>
          <SectionHead title="Detected Skills" description="Skills identified from your resume and technical sections." />
          {loading ? <SkeletonRows /> : <PillList className="scrollable-skills" items={data?.skills || []} empty="Upload a readable resume to detect skills." />}
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionHead title="Missing Skills" description="Useful terms to add if they reflect your real experience." />
          {missingSkills.length > 0 ? (
            <PillList items={missingSkills} />
          ) : (
            <div className="activity-item">
              <span className="muted">{data ? 'No missing skills identified.' : 'Upload your resume to identify missing skills.'}</span>
              <Sparkles size={18} color="#8b5cf6" />
            </div>
          )}
        </Card>

        <Card>
          <SectionHead title="Extraction Results" description="Projects, experience, education, and certifications." />
          {data ? (
            <div className="activity-list">
              <div className="activity-item"><span>Projects</span><span className="pill">{data.projects?.length || 0}</span></div>
              <div className="activity-item"><span>Experience</span><span className="pill">{data.experience?.length || 0}</span></div>
              <div className="activity-item"><span>Education</span><span className="pill">{data.education?.length || 0}</span></div>
              <div className="activity-item"><span>Certifications</span><span className="pill">{data.certifications?.length || 0}</span></div>
            </div>
          ) : (
            <motion.div className="activity-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="muted">Upload your resume to generate structured extraction.</span>
              <Sparkles size={18} color="#8b5cf6" />
            </motion.div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}
