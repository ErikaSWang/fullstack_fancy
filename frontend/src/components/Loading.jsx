import React, { useState, useEffect } from 'react';


// 3 different routes for fetching data from the backend

const Loading = () => {

    // 3 state variables to hold the data that's been fetched from the backend
    // 3 STATE VARIABLES FOR THE STATUS OF THE REQUESTS
    // (loading is used to show a loading message while in progress)

    const [hello, setHello] = useState('')
    const [welcome, setWelcome] = useState('')

    const [helloLoading, setHelloLoading] = useState(true)
    const [welcomeLoading, setWelcomeLoading] = useState(true)


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



    return (
        <>
            <h1>Full Stack App</h1>
            <p>{welcomeLoading ? 'Loading...' : welcome}</p>
            <p>{helloLoading ? 'Loading...' : hello}</p>
        </>
    )
}

export default Loading;