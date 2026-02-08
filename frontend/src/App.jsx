import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hello')
        const data = await res.json()
        setMessage(data.message)
        setLoading(false)
      } catch (err) {
        console.error('Error:', err)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  return (
    <div className="container">
      <h1>Full Stack App</h1>
      <p>{loading ? 'Loading...' : message}</p>
    </div>
  )
}

export default App
