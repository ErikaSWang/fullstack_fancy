import Button from 'react-bootstrap/Button';


const Logout = ({formMessage, setFormMessage, user, setUser}) => {

    const testProtectedRoute = async () => {
        let res = await fetch('/api/users/profile', { credentials: 'include' })

        if (res.status === 401) {
            const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
            if (!refreshResponse.ok) { setFormMessage('Session expired — please log in again'); return }
            res = await fetch('/api/users/profile', { credentials: 'include' })
        }

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