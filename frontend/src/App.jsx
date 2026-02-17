import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [hello, setHello] = useState('')
  const [welcome, setWelcome] = useState('')
  const [errorCheck, setErrorCheck] = useState('')
  const [loading, setLoading] = useState(true)

  // Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formMessage, setFormMessage] = useState('')


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




  // Send username/password to either /signup or /login
  const handleSubmit = async (endpoint) => {
    try {
      const res = await fetch(`/api/users/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      setFormMessage(data.message)
    } catch (err) {
      setFormMessage('Server error')
    }
  }

  return (
    <div className="container">
      <h1>Full Stack App</h1>
      <p>{loading ? 'Loading...' : welcome}</p>
      <p>{loading ? 'Loading...' : hello}</p>
      <p>{loading ? 'Loading...' : errorCheck}</p>

      <hr />
      <h2>Signup / Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => handleSubmit('signup')}>Sign Up</button>
      <button onClick={() => handleSubmit('login')}>Log In</button>
      {formMessage && <p>{formMessage}</p>}
    </div>
  )
}

export default App
