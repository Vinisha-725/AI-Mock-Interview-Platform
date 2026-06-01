import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('hiresense_user') || 'null')
  if (user?.id) {
    config.headers['X-User-Id'] = user.id
  }
  return config
})

export default api
