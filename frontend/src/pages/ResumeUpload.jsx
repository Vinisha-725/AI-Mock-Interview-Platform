import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { uploadResume } from '../services/resume'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setExtractedData(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    const response = await uploadResume(file)
    
    // Use actual extracted data from backend
    setExtractedData(response)
    setLoading(false)
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleStartInterview = () => {
    navigate('/interview-room')
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar role="candidate" />
        <div style={{ flex: 1, padding: '30px', backgroundColor: '#f5f5f5' }}>
          <h1 style={{ marginBottom: '30px' }}>Upload Resume</h1>

          {/* File Upload Section */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Upload Your Resume</h2>
            <div style={{ 
              padding: '40px', 
              border: '2px dashed #2196f3', 
              borderRadius: '12px', 
              textAlign: 'center',
              backgroundColor: '#e3f2fd',
              cursor: 'pointer'
            }}>
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                style={{ marginBottom: '15px' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                  {file ? file.name : 'Drag and drop your resume here or click to browse'}
                </p>
                <p style={{ margin: '0', color: '#888', fontSize: '14px' }}>
                  Supported formats: PDF, DOC, DOCX
                </p>
              </label>
            </div>
            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              style={{ 
                width: '100%',
                padding: '15px', 
                marginTop: '20px',
                backgroundColor: file && !loading ? '#2196f3' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: file && !loading ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? '⏳ Processing...' : '🚀 Upload & Extract'}
            </button>
          </div>

          {/* Extracted Data Section */}
          {extractedData && (
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '20px', color: '#333' }}>Extracted Information</h2>
              
              {/* Skills Section */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => toggleSection('skills')}
                  style={{ 
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#e8f5e9',
                    border: '2px solid #4caf50',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>💻 Skills</span>
                  <span style={{ fontSize: '24px' }}>{expandedSection === 'skills' ? '▼' : '▶'}</span>
                </button>
                {expandedSection === 'skills' && (
                  <div style={{ padding: '20px', backgroundColor: '#f9f9f9', marginTop: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {extractedData.skills.map((skill, index) => (
                        <span key={index} style={{ 
                          padding: '8px 16px', 
                          backgroundColor: '#4caf50', 
                          color: 'white', 
                          borderRadius: '20px',
                          fontSize: '14px'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Projects Section */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => toggleSection('projects')}
                  style={{ 
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#e3f2fd',
                    border: '2px solid #2196f3',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>🚀 Projects</span>
                  <span style={{ fontSize: '24px' }}>{expandedSection === 'projects' ? '▼' : '▶'}</span>
                </button>
                {expandedSection === 'projects' && (
                  <div style={{ padding: '20px', backgroundColor: '#f9f9f9', marginTop: '10px', borderRadius: '8px' }}>
                    {extractedData.projects.map((project, index) => (
                      <div key={index} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '10px', border: '1px solid #ddd' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{project.name}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#666' }}>{project.description}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {project.tech.map((tech, i) => (
                            <span key={i} style={{ 
                              padding: '4px 10px', 
                              backgroundColor: '#e3f2fd', 
                              color: '#1976d2', 
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience Section */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => toggleSection('experience')}
                  style={{ 
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#fff3e0',
                    border: '2px solid #ff9800',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e65100' }}>💼 Experience</span>
                  <span style={{ fontSize: '24px' }}>{expandedSection === 'experience' ? '▼' : '▶'}</span>
                </button>
                {expandedSection === 'experience' && (
                  <div style={{ padding: '20px', backgroundColor: '#f9f9f9', marginTop: '10px', borderRadius: '8px' }}>
                    {extractedData.experience.map((exp, index) => (
                      <div key={index} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '10px', border: '1px solid #ddd' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{exp.role}</h4>
                        <p style={{ margin: '0 0 5px 0', color: '#666', fontWeight: 'bold' }}>{exp.company}</p>
                        <p style={{ margin: '0', color: '#888', fontSize: '14px' }}>{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education Section */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => toggleSection('education')}
                  style={{ 
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#f3e5f5',
                    border: '2px solid #9c27b0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#7b1fa2' }}>🎓 Education</span>
                  <span style={{ fontSize: '24px' }}>{expandedSection === 'education' ? '▼' : '▶'}</span>
                </button>
                {expandedSection === 'education' && (
                  <div style={{ padding: '20px', backgroundColor: '#f9f9f9', marginTop: '10px', borderRadius: '8px' }}>
                    {extractedData.education.map((edu, index) => (
                      <div key={index} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '10px', border: '1px solid #ddd' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{edu.degree}</h4>
                        <p style={{ margin: '0 0 5px 0', color: '#666', fontWeight: 'bold' }}>{edu.institution}</p>
                        <p style={{ margin: '0', color: '#888', fontSize: '14px' }}>{edu.year}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tech Stack Section */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => toggleSection('techStack')}
                  style={{ 
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#fce4ec',
                    border: '2px solid #e91e63',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#c2185b' }}>⚙️ Tech Stack</span>
                  <span style={{ fontSize: '24px' }}>{expandedSection === 'techStack' ? '▼' : '▶'}</span>
                </button>
                {expandedSection === 'techStack' && (
                  <div style={{ padding: '20px', backgroundColor: '#f9f9f9', marginTop: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {extractedData.techStack.map((tech, index) => (
                        <span key={index} style={{ 
                          padding: '8px 16px', 
                          backgroundColor: '#e91e63', 
                          color: 'white', 
                          borderRadius: '20px',
                          fontSize: '14px'
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Certifications Section */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => toggleSection('certifications')}
                  style={{ 
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#e0f2f1',
                    border: '2px solid #009688',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#00695c' }}>🏆 Certifications</span>
                  <span style={{ fontSize: '24px' }}>{expandedSection === 'certifications' ? '▼' : '▶'}</span>
                </button>
                {expandedSection === 'certifications' && (
                  <div style={{ padding: '20px', backgroundColor: '#f9f9f9', marginTop: '10px', borderRadius: '8px' }}>
                    {extractedData.certifications.map((cert, index) => (
                      <div key={index} style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '8px', border: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px', marginRight: '10px' }}>📜</span>
                        <span style={{ color: '#333' }}>{cert}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                <button 
                  onClick={handleStartInterview}
                  style={{ 
                    flex: 1,
                    padding: '15px', 
                    backgroundColor: '#4caf50', 
                    color: 'white', 
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🎤 Start Interview
                </button>
                <button 
                  onClick={() => setExtractedData(null)}
                  style={{ 
                    flex: 1,
                    padding: '15px', 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Upload New Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
