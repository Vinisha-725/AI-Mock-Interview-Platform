import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { uploadResume } from '../services/resume'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [extractedSkills, setExtractedSkills] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    const response = await uploadResume(file)
    setExtractedSkills(response.skills)
    setLoading(false)
  }

  const handleStartInterview = () => {
    navigate('/interview-room')
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <h1>Upload Resume</h1>
        <div style={{ marginTop: '20px', padding: '20px', border: '2px dashed #ccc', borderRadius: '8px', textAlign: 'center' }}>
          <input 
            type="file" 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            style={{ marginBottom: '15px' }}
          />
          <br />
          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            style={{ padding: '10px 20px', cursor: file && !loading ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'Processing...' : 'Upload Resume'}
          </button>
        </div>

        {extractedSkills && (
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3>Extracted Skills:</h3>
            <ul style={{ marginTop: '10px' }}>
              {extractedSkills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
            <button 
              onClick={handleStartInterview}
              style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '15px' }}
            >
              Start Interview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
