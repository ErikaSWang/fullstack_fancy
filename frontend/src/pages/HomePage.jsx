import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Loading from '../components/Loading.jsx';
import Login from '../components/Login.jsx';
import Content from '../components/Content.jsx';
import Logout from '../components/LogoutTest.jsx';




function Home() {
  const [formMessage, setFormMessage] = useState('')

  // user is null when logged out, or the username string when logged in
  // (token now lives in an httpOnly cookie — JS can't touch it)
  const [user, setUser] = useState(null)


  // ON PAGE LOAD — ask the backend:
    // - is the user logged in?
    // - with a valid jwt?
    //   (returns the username)
    //   (and shows the logged in screen instead)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.username)
        }
      } catch (err) {
        // Not logged in — leave user as null
      }
    }
    checkAuth()
  }, [])



  
  return (
    <div className="container">

      <Loading />

      <hr />

      {formMessage && 
        <p>{formMessage}</p>
      }

      {user && (
        <>
          <Logout
            formMessage={formMessage}
            setFormMessage={setFormMessage}
            user={user}
            setUser={setUser}
          />
        </>
      )}

      <Card className="w-25 mt-2 p-4 bg-secondary text-white shadow-lg">
        { !user ?
          (
            <>
              <Login
                formMessage={formMessage}
                setFormMessage={setFormMessage}
                user={user}
                setUser={setUser}
              />
            </>
          )     
        :
          (
            <>
              <Content
                formMessage={formMessage}
                setFormMessage={setFormMessage}
              />
            </>
          )
        }
      </Card>

    </div>
  )
}

export default Home;
