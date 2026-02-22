import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './App.css'

function App() {
  const [hello, setHello] = useState('')
  const [welcome, setWelcome] = useState('')
  const [errorCheck, setErrorCheck] = useState('')
  const [helloLoading, setHelloLoading] = useState(true)
  const [welcomeLoading, setWelcomeLoading] = useState(true)
  const [failcheckLoading, setFailcheckLoading] = useState(true)
  
  // Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [content, setContent] = useState('')
  const [pastContent, setPastContent] = useState([])

  // USING LOCAL STORAGE TO PERSIST THE TOKEN (so it doesn't get lost on page refresh)
  const [token, setToken] = useState(localStorage.getItem('token'))

  

  useEffect(() => {
    const fetchWelcome = async () => {
      try {
        const res = await fetch('/api/welcome')
        const data = await res.json()
        setWelcome(data.message)
        setWelcomeLoading(false)
      } catch (err) {
        setWelcome('Error fetching welcome (server error)');
        setWelcomeLoading(false)
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
        setHelloLoading(false)
      } catch (err) {
        setHello('Error fetching hello (server error)');
        setHelloLoading(false)
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
        setFailcheckLoading(false)
      } catch (err) {
        setErrorCheck('The error check has failed (server error, not 404 bad route error)');
        setFailcheckLoading(false)
      }
    }
    fetchFailCheck()
  }, [])



  // SUBMIT USERNAME & PASSWORD TO THE BACKEND
  // (Same function handles both signup & login)

  const handleSubmit = async (endpoint) => {
    try {
      const res = await fetch(`/api/users/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      setFormMessage(data.message)

      // JWT IS SENT BACK if it's a login
      // (useState for current use)
      // (localStorage immediately
      if (endpoint === 'login' && data.token) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        //setTokenExpiry(data.tokenExpiry)
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

  const handleLogout = async () => {
    await fetch('/api/users/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    localStorage.removeItem('token')
    setToken(null)
    setFormMessage('Logged out!')
  }



   // SAVE USER CONTENT TO THE BACKEND
   // NB. THIS ROUTE IS ONLY AVAILABLE IF YOU HAVE A VALID TOKEN
   // SO THE TOKEN IS INCLUDED IN THE HEADERS
   // (it's like the user's driver's license)
   // Body - don't forget JSON needs to be sent as a string, and put back together on the other end

  const saveContent = async () => {
    try {
      const res = await fetch(`/api/saveContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })
      const data = await res.json()
      setFormMessage(data.message)

    } catch (err) {
      setFormMessage('Please try again')
    }
  }


  const getContent = async () => {
    try {
      const res = await fetch(`/api/getSavedContent`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setFormMessage(data.message)
      setPastContent(data.content)

    } catch (err) {
      setFormMessage('Please try again')
    }
  }



  
  return (
    <div className="container">
      <h1>Full Stack App</h1>
      <p>{welcomeLoading ? 'Loading...' : welcome}</p>
      <p>{helloLoading ? 'Loading...' : hello}</p>
      <p>{failcheckLoading ? 'Loading...' : errorCheck}</p>

      <hr />

      
      <h2>Signup / Login</h2>

      <Card className="w-25 mt-2 p-4 bg-secondary text-white shadow-lg">
        { !token && (
          <>
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
          </>
        )}

        {token && (
          <>
            <>
              <Form>
                <Form.Group className="mb-3" controlId="formContent">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    type="text"
                    as="textarea"
                    rows={3}
                    placeholder="Enter your thoughts here ..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="info" type="button" onClick={saveContent}>
                    Submit
                  </Button>
                </div>
              </Form>
            </>
            
          </>
          
        )}

      </Card>
      
      {token && (
          <div className="w-25 mt-2 d-flex justify-content-around">
            <Button variant="warning" onClick={testProtectedRoute}>
              Test Protected Route
            </Button>
            <Button variant="primary" onClick={getContent}>
              Load My Content
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
      )}

      {formMessage && <p>{formMessage}</p>}
      <hr />
      {pastContent.map((item) => ( 
        <Card key={item.id} className="w-25 m-2 bg-light shadow-sm">
          <Card.Body>{item.content}</Card.Body>
        </Card>
      ))}
      
    </div>
  )
}

export default App
