import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';


const Logout = ({formMessage, setFormMessage, user, setUser}) => {

    const testProtectedRoute = async () => {
        const res = await fetch('/api/users/profile', { credentials: 'include' })
        const data = await res.json()
        setFormMessage(data.message)
    }

    const handleLogout = async () => {
        await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include'
        })
        setUser(null)
        setFormMessage('Logged out!')
    }


    return (
        <>
            <div className="w-25 mt-2 d-flex justify-content-center">
            <Button variant="warning" className="me-1" onClick={testProtectedRoute}>
              Test Protected Route
            </Button>
            <Button variant="danger" className="ms-1" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </>
    )
}

export default Logout;