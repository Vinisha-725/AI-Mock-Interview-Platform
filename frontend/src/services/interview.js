import api from './api'

export const startInterview = async (skills) => {
  const response = await api.post('/interview/start', { skills })
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
