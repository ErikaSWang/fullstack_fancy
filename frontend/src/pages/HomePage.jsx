import { useState } from 'react'
import { NavLink } from 'react-router-dom';

// FIRST TIME USING A 'CUSTOM HOOK'
// Looks to basically be a way to save part of the code on another page??
// MUST USE ACTUAL REACT HOOKS INSIDE THE CUSTOM HOOK (useState, useEffect)
// (CheckAuth just checks the status of the page on loading)
// (May use it again for the Dashboard page?)
import { useCheckAuth } from '../hooks/useCheckAuth.js';

import Loading from '../components/Loading.jsx';
import Login from '../components/Login.jsx';
import Content from '../components/Content.jsx';
import Logout from '../components/Logout.jsx';

import Card from 'react-bootstrap/Card';
import { Button } from '@mui/material';



// Uses 4 components:
    // Loading
    // Login
    // Content
    // Logout

function Home() {

  // Uses 2 state variables (passed in as props to the components):
  const [formMessage, setFormMessage] = useState('')
  const { user, setUser } = useCheckAuth()

  
  
  return (
    <div className="container">

      <NavLink to={`/dashboard`}>
        <Button variant="contained">Dashboard</Button>
      </NavLink>

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
