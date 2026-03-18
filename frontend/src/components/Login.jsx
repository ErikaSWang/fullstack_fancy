import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


const Login = ({formMessage, setFormMessage, user, setUser}) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [recaptchaToken, setRecaptchaToken] = useState(null)
    const recaptchaRef = useRef(null)

    // SUBMIT USERNAME & PASSWORD TO THE BACKEND
    // (Same function handles both signup & login)
    // reCAPTCHA v2 checkbox is shown for signup only

    const handleSubmit = async (endpoint) => {
        try {
            let body = { username, password }

            // For signup, require the reCAPTCHA checkbox to be ticked
            if (endpoint === 'signup') {
                if (!recaptchaToken) {
                    setFormMessage('Please complete the reCAPTCHA first')
                    return
                }
                body = { ...body, recaptchaToken }
            }

            const res = await fetch(`/api/users/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',   // tells the browser to send/receive cookies
                body: JSON.stringify(body)
            })
            const data = await res.json()
            setFormMessage(data.message)

            // Reset the reCAPTCHA after each signup attempt
            if (endpoint === 'signup') {
                recaptchaRef.current.reset()
                setRecaptchaToken(null)
            }

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

              {/* reCAPTCHA v2 checkbox - required before signup */}
              <div className="mb-3">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken(null)}
                />
              </div>

              <div className="d-flex m-2 justify-content-end">
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => handleSubmit('signup')}
                >
                  Sign Up
                </Button>
                <Button
                  variant="success"
                  type="button"
                  onClick={() => handleSubmit('login')}
                >
                  Log In
                </Button>
              </div>

            </Form>
        </>
    )
}

export default Login;
