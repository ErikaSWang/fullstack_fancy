import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [hello, setHello] = useState('')
  const [welcome, setWelcome] = useState('')
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchWelcome = async () => {
      try {
        const res = await fetch('/api/welcome')
        const data = await res.json()
        setWelcome(data.message)
        setLoading(false)
      } catch (err) {
        console.error('Error:', err)
        setWelcome('Error fetching welcome');
        setLoading(false)
      }
    }
    
    fetchWelcome()
  }, [])

  useEffect(() => {
    const fetchHello = async () => {
      try {
        const res = await fetch('/api/hello')
        const data = await res.json()
        setHello(data.message)
        setLoading(false)
      } catch (err) {
        console.error('Error:', err)
        setHello('Error fetching hello');
        setLoading(false)
      }
    }
    
    fetchHello()
  }, [])



  return (
    <div className="container">
      <h1>Full Stack App</h1>
      <p>{loading ? 'Loading...' : welcome}</p>
      <p>{loading ? 'Loading...' : hello}</p>
      
    </div>
  )
}

export default App
