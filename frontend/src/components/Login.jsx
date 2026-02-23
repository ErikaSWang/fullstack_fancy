import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


const Login = ({formMessage, setFormMessage, user, setUser}) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    // SUBMIT USERNAME & PASSWORD TO THE BACKEND
    // (Same function handles both signup & login)

    const handleSubmit = async (endpoint) => {
        try {
        const res = await fetch(`/api/users/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',   // tells the browser to send/receive cookies
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        setFormMessage(data.message)

        // On login the backend sets the httpOnly cookie — we just grab the username
        if (endpoint === 'login' && data.username) {
            setUser(data.username)
        }
        } catch (err) {
        setFormMessage('Server error')
        }
    }

    return (
        <>
            <h3 className="mb-4">Signup / Login</h3>
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
              <div className="d-flex m-2 justify-content-end">
                <Button variant="primary" type="button" onClick={() => handleSubmit('signup')}>
                  Sign Up
                </Button>
                <Button variant="success" type="button" onClick={() => handleSubmit('login')}>
                  Log In
                </Button>
              </div>
            </Form>
        </>
    )
}

export default Login;