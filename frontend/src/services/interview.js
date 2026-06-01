import api from './api'

export const startInterview = async (data) => {
  const response = await api.post('/interview/start', data)
  return response.data
}

export const submitAnswer = async (data) => {
  const response = await api.post('/interview/answer', data)
  return response.data
}

export const getReport = async (id) => {
  const response = await api.get(`/report/${id}`)
  return response.data
}

export const getSession = async (interviewId) => {
  const response = await api.get(`/interview/session/${interviewId}`)
  return response.data
}

export const getHistory = async () => {
  try {
    const response = await api.get('/interview/history', { timeout: 5000 })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.warn('Interview history unavailable, using empty dashboard state:', error.message)
    return []
  }
}

export const endInterview = async (interviewId) => {
  const response = await api.post(`/interview/end/${interviewId}`)
  return response.data
}

export const runDSACode = async (data) => {
  const response = await api.post('/interview/dsa/run', data)
  return response.data
}

export const submitDSASolution = async (data) => {
  const response = await api.post('/interview/dsa/submit', data)
  return response.data
}

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  
  const response = await api.post('/interview/transcribe', formData)
  return response.data
}
