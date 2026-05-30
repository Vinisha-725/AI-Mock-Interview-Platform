import { useState, useEffect } from 'react'

export default function Timer() {
  const [seconds, setSeconds] = useState(0)
  const [minutes, setMinutes] = useState(30)

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1)
      } else if (minutes > 0) {
        setMinutes(minutes - 1)
        setSeconds(59)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, minutes])

  return (
    <div style={{ padding: '10px 20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
      <span style={{ fontWeight: 'bold', color: '#856404' }}>
        Time Remaining: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  )
}
