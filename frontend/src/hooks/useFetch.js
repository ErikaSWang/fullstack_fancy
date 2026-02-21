import { useState, useEffect } from 'react'


// CUSTOM HOOK - useFetch
// A hook is just a function that uses other React hooks inside it (useState, useEffect)
// This one bundles the fetch + loading + error pattern into one reusable thing
// Instead of writing a useEffect block for every fetch, you just call useFetch(url)

export function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url)
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}
