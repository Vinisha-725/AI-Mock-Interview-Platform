import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { ArrowRight, BrainCircuit, ChartNoAxesCombined, FileSearch, Mic, ShieldCheck, Sparkles } from 'lucide-react'
import { LandingNav, SectionHead } from '../components/PremiumUI'
import { readinessTrend } from '../data/mockData'

export default function Landing() {
  return (
    <div className="landing">
      <LandingNav />
      <main>
        <section className="container hero">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="eyebrow">
              <Sparkles size={16} />
              AI interview intelligence for ambitious candidates
            </div>
            <h1>Ace Every Interview With AI</h1>
            <p>Practice real-world interviews, receive personalized feedback, and measure your hiring readiness.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/interview-room">
                Start Mock Interview
                <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-ghost" to="/candidate-dashboard">View Demo</Link>
            </div>
            <div className="hero-proof">
              <div className="proof-card glass"><strong>86%</strong><span>Avg readiness lift</span></div>
              <div className="proof-card glass"><strong>12k+</strong><span>AI interviews</span></div>
              <div className="proof-card glass"><strong>4.9</strong><span>Candidate rating</span></div>
            </div>
          </motion.div>

          <motion.div className="mock-dashboard" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65 }}>
            <div className="dashboard-preview glass">
              <div className="preview-top">
                <div className="window-dots"><span /><span /><span /></div>
                <span className="pill">Live readiness</span>
              </div>
              <div className="preview-grid">
                <div className="preview-panel">
                  <span className="muted">Hiring Score</span>
                  <div className="stat-value">86%</div>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={readinessTrend}>
                      <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.22} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="preview-panel">
                  <span className="muted">AI Feedback</span>
                  <h3>Strong React fundamentals. Improve system design tradeoffs and answer structure.</h3>
                  <div className="activity-list">
                    <div className="activity-item"><span>Technical</span><span className="pill">88%</span></div>
                    <div className="activity-item"><span>Communication</span><span className="pill">79%</span></div>
                  </div>
                </div>
              </div>
            </div>
            <motion.div className="floating-card glass one" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
              <Mic size={20} color="#a5b4fc" />
              <h3>Follow-up generated</h3>
              <p>Explain how you would scale this API.</p>
            </motion.div>
            <motion.div className="floating-card glass two" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4.8 }}>
              <ChartNoAxesCombined size={20} color="#38bdf8" />
              <h3>Skill growth</h3>
              <p>System design improved by 18% this week.</p>
            </motion.div>
            <motion.div className="floating-card glass three" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5.2 }}>
              <ShieldCheck size={20} color="#22c55e" />
              <h3>Ready</h3>
              <p>Matched to Frontend Engineer roles.</p>
            </motion.div>
          </motion.div>
        </section>

        <section id="features" className="container section">
          <SectionHead title="Built for serious interview prep" description="Every workflow is designed to turn practice sessions into measurable hiring readiness." />
          <div className="feature-grid">
            {[
              [FileSearch, 'Resume Intelligence', 'Detect strengths, gaps, missing keywords, and role alignment in seconds.'],
              [Mic, 'Adaptive Interviews', 'Practice with AI questions that react to your answers and skill level.'],
              [BrainCircuit, 'Career Roadmap', 'Get a guided plan for what to learn, polish, and practice next.'],
            ].map(([Icon, title, text]) => (
              <motion.div className="feature-card glass" key={title} whileHover={{ y: -6 }}>
                <Icon size={28} />
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="how" className="container section">
          <SectionHead title="How it works" description="Upload, practice, review, improve. HireSense AI keeps the loop tight and actionable." />
          <div className="three-col">
            {['Analyze your resume and job description', 'Run a realistic AI mock interview', 'Review your score, gaps, and roadmap'].map((item, index) => (
              <div className="feature-card glass" key={item}>
                <span className="pill">Step {index + 1}</span>
                <h3>{item}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
