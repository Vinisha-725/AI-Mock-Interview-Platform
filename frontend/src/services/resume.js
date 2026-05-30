import api from './api'

export const uploadResume = async (file, jdText = '', jdFile = null) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('jd_text', jdText)
  if (jdFile) {
    formData.append('jd_file', jdFile)
  }
  
  const response = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}
