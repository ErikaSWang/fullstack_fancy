import { useState, useEffect } from 'react'


// CUSTOM HOOK - useFetch
// A hook is just a function that uses other React hooks inside it (useState, useEffect)
// This one bundles the fetch + loading + error pattern into one reusable thing
// Instead of writing a useEffect block for every fetch, you just call useFetch(url)

export function useCheckAuth() {
  const [user, setUser] = useState(null)

  // ON PAGE LOAD, WE DO A STATUS CHECK
  // -> checkJWT -> exit
  //             -> checkUUID -> exit
  //                          -> createJWT -> refreshUUID

  // Update - we now have TWO different tokens!!
  //
  // 1. The short-term 'real' token, for between front/back
  //    (THIS IS LIKE A VALID PASSPORT THAT YOU CAN USE TO DO TRANSACTIONS)
  //
  // 2. The long-term '30-day' token, that 'okays' reissues of #1 (if it's expired)
  //    (THIS IS LIKE A SAFETY DEPOSIT BOX THAT HOLDS YOUR PASSPORT FOR 30 DAYS, UNTIL YOU NEED IT)
  //    (30 day window continually refreshes - will lapse after 1m of inactivity)
  
  // PROCEDURE:
  // 1. IS THERE AN SHORT-TERM 'REAL' TOKEN ACTIVE RIGHT NOW?
        // -> we're good to go, exit
  // 2. IS THERE A LONG-TERM '30-DAY' TOKEN 'FAST PASS' (to get your passport back)?
        // backend issues a fresh short-term 'real' token
        // -> we're good to go, exit
  // 3. OTHERWISE USER HAS TO LOGIN FRESH (OR SIGN UP) to get their passport activated

  // (NB The error checks all come FIRST, so the logic isn't intuitive)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. LOGGED IN? 
        const activeToken = await fetch('/api/auth/checkJWT', { credentials: 'include' })

        // 1. a) YES
        //    (Status code: 200)
        //    (MEANS USER HAS BEEN ACTIVE WITHIN THE PAST 15 MIN)
        //
        if (activeToken.ok) {
          const data = await activeToken.json()
          setUser(data.username)
          return
        }

        // 1. b) NO
        //    Potential Status codes:
        //      401 - THREE POSSIBILITIES
        //        - EXPIRED (most common - SEE BELOW, #2)
        //        - NO 'PLACEHOLDER' TOKEN (new user, old user hasn't visited in a long time)
        //        - (blacklisted - would be a bootleg token, I guess?)

        //    Also the following:
          // (handled below in the catch-all)
        //      500 - SERVER CRASH
        //      503 - server temporarily unavailable?
        //      404 - route wasn't found (backend coding error)
        //
        if (activeToken.status !== 401) {
          return
        }

        // 2. FOR STATUS CODE 401 EXPIRED 'ACTIVE' TOKEN, WE CHECK FOR A PLACEHOLDER 'FAST-PASS' ISSUE
        //    (if they've logged in within the past 30 days, and still have a valid cookie,
        //     they can bypass the login process, and just get issued a fresh 'active' token
        //    - otherwise they have to log-in again (or sign up))

        const fastPass = await fetch('/api/auth/checkUUID', {
          method: 'POST',
          credentials: 'include'
        })

        // Issue of fresh JWT failed — user needs to log in again, leave user as null
        // (EVERY STATUS CODE, EXCEPT 200)
        //
        if (!fastPass.ok) {
          return
        }

        // 3. FOR USERS WHO HAVE ALREADY LOGGED IN WITHIN 30 DAYS (Status Code: 200)
        // (they show as 'staying' logged in)
        // (they see the logged in page)
        // (frontend knows their name)
        // 
        const data = await fastPass.json()
        setUser(data.username)

      } catch (err) {
        // Not logged in — leave user as null
      }
    }
    checkAuth()
  }, [])

  return { user }
}