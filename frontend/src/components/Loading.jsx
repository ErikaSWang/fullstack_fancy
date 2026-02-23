import React, { useState, useEffect } from 'react';

const Loading = () => {
    const [hello, setHello] = useState('')
    const [welcome, setWelcome] = useState('')
    const [errorCheck, setErrorCheck] = useState('')
    const [helloLoading, setHelloLoading] = useState(true)
    const [welcomeLoading, setWelcomeLoading] = useState(true)
    const [failcheckLoading, setFailcheckLoading] = useState(true)


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

    return (
        <>
            <h1>Full Stack App</h1>
            <p>{welcomeLoading ? 'Loading...' : welcome}</p>
            <p>{helloLoading ? 'Loading...' : hello}</p>
            <p>{failcheckLoading ? 'Loading...' : errorCheck}</p>
        </>
    )
}

export default Loading;