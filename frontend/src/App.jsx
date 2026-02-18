import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
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
  const [token, setToken] = useState(localStorage.getItem('token'))


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



  // SUBMIT INPUT TO THE BACKEND
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
      // On login, the server returns a token — save it for future requests
      if (endpoint === 'login' && data.token) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
      }
    } catch (err) {
      setFormMessage('Server error')
    }
  }

  const testProtectedRoute = async () => {
    const res = await fetch('/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setFormMessage(data.message)
  }

  return (
    <div className="container">
      <h1>Full Stack App</h1>
      <p>{loading ? 'Loading...' : welcome}</p>
      <p>{loading ? 'Loading...' : hello}</p>
      <p>{loading ? 'Loading...' : errorCheck}</p>

      <hr />

      
      <h2>Signup / Login</h2>

      <Card className="w-25 mt-2 p-4 bg-secondary text-white shadow-lg">
        <Form>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="primary" type="button" onClick={() => handleSubmit('signup')}>
              Sign Up
            </Button>
            <Button variant="success" type="button" onClick={() => handleSubmit('login')}>
              Log In
            </Button>
          </div>
        </Form>
      </Card>

      {token && (
        <Button variant="warning" className="mt-3" onClick={testProtectedRoute}>
          Test Protected Route
        </Button>
      )}

      {formMessage && <p>{formMessage}</p>}

    </div>
  )
}

export default App
