import Button from 'react-bootstrap/Button';

// 2 ROUTES:
    // 1. Test protected route (to show how token refreshing works)
    // 2. Logout
const Logout = ({formMessage, setFormMessage, user, setUser}) => {

    const testProtectedRoute = async () => {
        // NB. PROCESS IS ALWAYS THE SAME:
               // a) Assume the user has a valid token
               // b) If not, check to see if the user has a valid refresh token
                    // (then try again)
               // c) They really shouldn't be seeing the screen if they don't have either
                    // But we provide the 3rd option just in case

        // a) Assume a valid token, attempt to access this route
        let res;
        
        // (Helper function)
        const fetchConfirmation = async () => {
            res = await fetch('/api/users/profile', {
                credentials: 'include'
            })
        }

        await fetchConfirmation()
        

        // b) Try to refresh token
        if (res.status === 401) {
            const refreshResponse = await fetch('/api/auth/checkUUID', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })

            // c) User not logged in
                  // (Shouldn't happen)
            if (!refreshResponse.ok) {
                setFormMessage('Session expired — please log in again');
                return
            }

            // b) (cont'd) Try protected route again
            await fetchConfirmation()
        }

        const data = await res.json()
        setFormMessage(data.message)
    }


    // LOGOUT ROUTE IS SAME FOR ALL LOGINS
    // (Just adds valid token to the blacklist, and clears the cookie)
    const handleLogout = async () => {
        await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
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