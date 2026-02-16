import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [hello, setHello] = useState('')
  const [welcome, setWelcome] = useState('')
  const [errorCheck, setErrorCheck] = useState('')
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
        setWelcome('Error fetching welcome (server error)');
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
        setHello('Error fetching hello (server error)');
        setLoading(false)
      }
    }
    
    fetchHello()

  }, [])


  useEffect(() => {
    const fetchFailCheck = async () => {
      try {
        const res = await fetch('/api/errorFail')
        const data = await res.json()
        setErrorCheck(data.message)
        setLoading(false)
      } catch (err) {
        console.error('Error:', err)
        setErrorCheck('The error check has failed (server error, not 404 bad route error)');
        setLoading(false)
      }
    }

    fetchFailCheck()

  }, [])




  return (
    <div className="container">
      <h1>Full Stack App</h1>
      <p>{loading ? 'Loading...' : welcome}</p>
      <p>{loading ? 'Loading...' : hello}</p>
      <p>{loading ? 'Loading...' : errorCheck}</p>
    </div>
  )
}

export default App
