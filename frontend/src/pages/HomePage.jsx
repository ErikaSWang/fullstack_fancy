import { useState } from 'react'
import { useCheckAuth } from '../hooks/useCheckAuth.js';
import Card from 'react-bootstrap/Card';
import Loading from '../components/Loading.jsx';
import Login from '../components/Login.jsx';
import Content from '../components/Content.jsx';
import Logout from '../components/LogoutTest.jsx';




function Home() {

  const [formMessage, setFormMessage] = useState('')
  const { user, setUser } = useCheckAuth()

  // Google Recaptcha Key (frontend): 6Le7tXwsAAAAAHY7MBxqA1M5vrd3b7V3JdQPKi1Y
  
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
