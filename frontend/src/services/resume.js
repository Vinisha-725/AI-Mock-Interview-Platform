import api from './api'

export const uploadResume = async (file, jdText = '', jdFile = null) => {
  const formData = new FormData()
  
  const user = JSON.parse(localStorage.getItem('hiresense_user') || 'null')
  if (user?.id) {
    formData.append('user_id', user.id)
  }

  formData.append('file', file)
  formData.append('jd_text', jdText)
  if (jdFile) {
    formData.append('jd_file', jdFile)
  }
  
  const response = await api.post('/resume/upload', formData, {
    timeout: 90000,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}
