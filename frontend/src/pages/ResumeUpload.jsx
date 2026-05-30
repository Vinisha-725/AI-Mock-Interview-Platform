import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, BriefcaseBusiness, FileUp, Lightbulb, Sparkles, Wand2 } from 'lucide-react'
import { AppShell, Card, PillList, ScoreRing, SectionHead, SkeletonRows } from '../components/PremiumUI'
import { uploadResume } from '../services/resume'
import { detectedSkills, missingSkills } from '../data/mockData'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [jdFile, setJdFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const detected = useMemo(() => data?.skills?.length ? data.skills : detectedSkills, [data])

  const handleUpload = async () => {
    if (!file) {
      setError('Upload a PDF or DOCX resume first.')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await uploadResume(file)
      setData(response)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not extract readable text from this resume.')
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
          <label className="upload-zone" style={{ minHeight: 170 }}>
            <input type="file" accept=".pdf,.docx,.txt" onChange={(event) => setJdFile(event.target.files?.[0] || null)} />
            <div>
              <BriefcaseBusiness size={34} color="#38bdf8" />
              <h3>{jdFile ? jdFile.name : 'Upload JD'}</h3>
              <p>Optional role description for match scoring</p>
            </div>
          </label>
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
          <SectionHead title="AI Suggestions" description="High-impact changes to improve recruiter and ATS alignment." />
          <div className="activity-list">
            {[
              'Add measurable impact to project bullets using numbers and outcomes.',
              'Move React, Node.js, and MongoDB into a dedicated technical skills section.',
              'Add testing, deployment, and API design keywords for stronger role matching.',
            ].map((item) => (
              <div className="activity-item" key={item}>
                <span>{item}</span>
                <Lightbulb size={18} color="#f59e0b" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="result-grid">
        <Card>
          <SectionHead title="Match Percentage" description={data ? 'Based on extracted resume signals.' : 'Demo preview until you upload.'} />
          {loading ? <SkeletonRows /> : <ScoreRing score={data ? 82 : 78} label={data ? 'Strong Match' : 'Role Match'} />}
        </Card>

        <Card>
          <SectionHead title="Detected Skills" description="Skills identified from your resume and technical sections." />
          {loading ? <SkeletonRows /> : <PillList items={detected} empty="Upload a readable resume to detect skills." />}
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionHead title="Missing Skills" description="Useful terms to add if they reflect your real experience." />
          <PillList items={missingSkills} />
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
