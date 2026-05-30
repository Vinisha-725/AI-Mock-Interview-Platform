import { Bot, Clock3, Mic, MonitorUp, Send, UserRound, Video } from 'lucide-react'
import { AppShell, Card, SectionHead } from '../components/PremiumUI'

const questions = [
  'Walk me through a project where you improved performance.',
  'How would you design an interview analytics dashboard?',
  'What tradeoffs did you make in your latest full-stack project?',
]

export default function InterviewRoom() {
  return (
    <AppShell title="Mock Interview" description="A professional AI interview room with adaptive follow-up questions and live transcript capture.">
      <div className="interview-layout">
        <div className="video-panel panel-card glass">
          <div className="ai-orb">
            <div style={{ textAlign: 'center' }}>
              <div className="brand-mark" style={{ width: 86, height: 86, borderRadius: 28, margin: '0 auto 18px' }}>
                <Bot size={42} />
              </div>
              <h2 style={{ margin: 0 }}>AI Interviewer</h2>
              <p className="muted">Listening for clarity, depth, confidence, and role fit.</p>
            </div>
          </div>
          <div className="question-card">
            <div className="stat-top">
              <span className="pill"><Clock3 size={14} /> 12:48 remaining</span>
              <span className="pill">Question 3 of 8</span>
            </div>
            <h2>Explain how you would structure a scalable resume analysis pipeline.</h2>
            <p className="muted">Include parsing, scoring, error handling, and candidate feedback.</p>
            <div className="actions" style={{ marginTop: 18 }}>
              <button className="btn btn-primary"><Mic size={18} /> Answer</button>
              <button className="btn btn-ghost"><Send size={18} /> Submit</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <Card>
            <SectionHead title="Webcam Preview" />
            <div className="webcam">
              <Video size={34} color="#a5b4fc" />
            </div>
          </Card>

          <Card>
            <SectionHead title="Previous Questions" />
            <div className="activity-list">
              {questions.map((question) => (
                <div className="activity-item" key={question}>
                  <span>{question}</span>
                  <MonitorUp size={17} color="#9ca3af" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHead title="Transcript" />
            <div className="transcript">
              <div className="bubble"><Bot size={15} /> Tell me about the architecture choices in your project.</div>
              <div className="bubble"><UserRound size={15} /> I separated parsing, scoring, and recommendation generation into services...</div>
              <div className="bubble"><Bot size={15} /> Good. What would you do if PDF text extraction failed?</div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
