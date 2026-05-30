export const readinessTrend = [
  { week: 'W1', score: 54, confidence: 48 },
  { week: 'W2', score: 61, confidence: 55 },
  { week: 'W3', score: 68, confidence: 63 },
  { week: 'W4', score: 74, confidence: 69 },
  { week: 'W5', score: 81, confidence: 76 },
  { week: 'W6', score: 86, confidence: 82 },
]

export const skillGrowth = [
  { skill: 'React', current: 88, target: 95 },
  { skill: 'System Design', current: 72, target: 88 },
  { skill: 'DSA', current: 66, target: 84 },
  { skill: 'Communication', current: 79, target: 90 },
]

export const radarMetrics = [
  { metric: 'Technical', score: 86 },
  { metric: 'Communication', score: 78 },
  { metric: 'Confidence', score: 82 },
  { metric: 'Attention', score: 74 },
  { metric: 'Timing', score: 88 },
]

export const platformUsage = [
  { day: 'Mon', interviews: 42, users: 128 },
  { day: 'Tue', interviews: 58, users: 152 },
  { day: 'Wed', interviews: 63, users: 168 },
  { day: 'Thu', interviews: 77, users: 193 },
  { day: 'Fri', interviews: 91, users: 224 },
  { day: 'Sat', interviews: 69, users: 182 },
]

export const recentActivity = [
  'Completed Frontend Engineer mock interview',
  'Resume analysis improved by 14%',
  'Career Coach created a 3-week roadmap',
  'Added Senior React Developer job description',
]

export const detectedSkills = ['React.js', 'Node.js', 'FastAPI', 'MongoDB', 'Docker', 'OpenAI', 'Tailwind CSS', 'GitHub']
export const missingSkills = ['System Design', 'Testing Strategy', 'AWS ECS', 'Accessibility']

export const recentInterviews = [
  { candidate: 'Aarav Mehta', role: 'Frontend Engineer', score: '86%', status: 'Ready' },
  { candidate: 'Maya Rao', role: 'Data Analyst', score: '74%', status: 'Needs Review' },
  { candidate: 'Noah Khan', role: 'Backend Engineer', score: '81%', status: 'Ready' },
  { candidate: 'Sara Lee', role: 'Product Analyst', score: '69%', status: 'Coaching' },
]

export const recruiterOverview = [
  { label: 'Total Candidates', value: '428', change: '+34 this month' },
  { label: 'Interviews Completed', value: '312', change: '+48 this month' },
  { label: 'Ready for Hiring', value: '76', change: '18% of pipeline' },
  { label: 'Avg Readiness Score', value: '81%', change: '+6% this month' },
  { label: 'New This Week', value: '42', change: '+12 vs last week' },
]

export const candidatePipeline = [
  { stage: 'Applied', count: 148, color: '#38bdf8' },
  { stage: 'Interviewed', count: 96, color: '#6366f1' },
  { stage: 'Under Review', count: 64, color: '#f59e0b' },
  { stage: 'Ready to Hire', count: 76, color: '#22c55e' },
  { stage: 'Rejected', count: 44, color: '#fb7185' },
]

export const recruiterCandidates = [
  {
    id: 'aarav-mehta',
    name: 'Aarav Mehta',
    targetRole: 'Frontend Engineer',
    resumeMatch: 92,
    readiness: 88,
    interviewScore: 86,
    status: 'Ready to Hire',
    recommendation: 'Recommended for Hiring',
    reasoning: 'Strong frontend fundamentals, clean communication, and practical project depth. Proceed to final interview round.',
    skills: ['React.js', 'TypeScript', 'Node.js', 'GraphQL', 'Testing'],
    gaps: ['System Design', 'AWS'],
    projects: ['Design System Migration', 'Interview Analytics Dashboard'],
    experience: '3 years frontend product engineering',
  },
  {
    id: 'maya-rao',
    name: 'Maya Rao',
    targetRole: 'Data Analyst',
    resumeMatch: 84,
    readiness: 77,
    interviewScore: 74,
    status: 'Under Review',
    recommendation: 'Potential Fit',
    reasoning: 'Strong analytics profile with good SQL and visualization skills. Needs deeper statistical reasoning before final round.',
    skills: ['Python', 'SQL', 'Tableau', 'Pandas', 'A/B Testing'],
    gaps: ['Hypothesis Testing', 'Stakeholder Communication'],
    projects: ['Sales Forecasting Model', 'Customer Segmentation'],
    experience: '2 years analytics and reporting',
  },
  {
    id: 'noah-khan',
    name: 'Noah Khan',
    targetRole: 'Backend Engineer',
    resumeMatch: 89,
    readiness: 83,
    interviewScore: 81,
    status: 'Interviewed',
    recommendation: 'Potential Fit',
    reasoning: 'Good API design and database knowledge. Needs stronger distributed systems examples.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis'],
    gaps: ['Distributed Systems', 'Kubernetes'],
    projects: ['Resume Parser API', 'Scoring Service'],
    experience: '3 years backend development',
  },
  {
    id: 'sara-lee',
    name: 'Sara Lee',
    targetRole: 'Product Analyst',
    resumeMatch: 73,
    readiness: 68,
    interviewScore: 69,
    status: 'Needs Improvement',
    recommendation: 'Needs Improvement',
    reasoning: 'Promising product instincts, but answers need clearer metrics and more structured problem solving.',
    skills: ['SQL', 'Amplitude', 'Experimentation', 'Dashboards'],
    gaps: ['Executive Communication', 'Causal Analysis'],
    projects: ['Activation Funnel Study', 'Retention Dashboard'],
    experience: '1.5 years product analytics',
  },
]

export const recruiterSkillAnalytics = [
  { name: 'React', value: 64 },
  { name: 'Python', value: 58 },
  { name: 'SQL', value: 51 },
  { name: 'Node.js', value: 42 },
  { name: 'Docker', value: 36 },
]

export const recruiterSkillGaps = [
  { name: 'System Design', value: 48 },
  { name: 'Cloud Deployment', value: 39 },
  { name: 'Testing', value: 34 },
  { name: 'Communication', value: 28 },
]

export const roleDistribution = [
  { role: 'Frontend', candidates: 118 },
  { role: 'Backend', candidates: 96 },
  { role: 'Data', candidates: 84 },
  { role: 'Product', candidates: 52 },
  { role: 'DevOps', candidates: 38 },
]

export const readinessDistribution = [
  { band: '90+', count: 34 },
  { band: '80-89', count: 76 },
  { band: '70-79', count: 128 },
  { band: '60-69', count: 92 },
  { band: '<60', count: 44 },
]
