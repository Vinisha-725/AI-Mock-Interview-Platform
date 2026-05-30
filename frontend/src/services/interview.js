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
  const response = await api.get('/interview/history')
  return response.data
}

export const endInterview = async (interviewId) => {
  const response = await api.post(`/interview/end/${interviewId}`)
  return response.data
}
