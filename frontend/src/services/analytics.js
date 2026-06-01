import api from './api'

export const getCandidateReport = async () => {
  // Check if we have a cached report to speed up loading
  const cached = localStorage.getItem('hiresense_report_cache')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      // Optional: Add cache expiration logic here if needed
      return parsed
    } catch (e) {
      // Ignore parse errors and fetch fresh
    }
  }

  const response = await api.get('/analytics/candidate/report')
  
  // Cache the fresh report
  if (response.data) {
    localStorage.setItem('hiresense_report_cache', JSON.stringify(response.data))
  }
  
  return response.data
}

export const clearReportCache = () => {
  localStorage.removeItem('hiresense_report_cache')
}
