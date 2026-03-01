import jwt from 'jsonwebtoken'
import redis from '../models/redis-cache.js'


// CHECK JWT

// Three steps to check if JWT Token is valid:
//   1. Is there a token?
//   2. Has the user logged out (and token placed in expired bucket (in REDIS))?
//   3. Verify the token (?? What does this involve?)


// ADVANCED - NEW 
// JWT IS NOW STORED IN A COOKIE (prev localstorage, in the browser))
// (cookie was automatically sent along with the fetch from the frontend)
// (PS check postman for confirmation!)


export async function checkJWT(req, res, next) {

  // Step 1. IS THERE A COOKIE?
  // 
  const tokenJWT = req.cookies.token1


  // (Exit 1)
  // IF NO COOKIE
  // OR IF COOKIE, BUT TOKEN NO LONGER VALID
  // (program exits back to the front-end to check for the UUID placeholder)
  //
  if (!tokenJWT) return res.status(401).json({ message: 'No token provided' })


  // (Exit 2)
  // IF JWT, CHECK THE BLACKLIST (just to be safe)
  //    (shouldn't happen, since the user can't access this route without a live token)
  //    (for hacker tokens, or race condition edge cases, misc bugs, etc - better safe than sorry)
  //    (BLACKLIST IS ON REDIS)
  const blacklisted = await redis.get(`blacklist:${tokenJWT}`)

  if (blacklisted) return res.status(401).json({ message: 'Token has been revoked — please log in again' })


  // (Exit 3)
  // MAKE SURE IT'S 'AUTHENTIC' (issued by us, not a fake)
  //
  jwt.verify(tokenJWT, process.env.JWT_SECRET, (err, decoded) => {

    if (err) return res.status(401).json({ message: 'Invalid or expired token' })


    // Step 2. IF AUTHENTIC, EXTRACT THE USERNAME
    // (NB This is middleware - the req.user means the data is being passed
    //  along the pipeline to the next function to handle the return to the user
    //  DO WE WANT TO JUST SEND THE 200 MESSAGE RIGHT HERE INSTEAD??)
    //
    req.user = decoded

    
    // BEGINNING OF REFRESH TOKEN - OPTION 1
    // (The only extra code needed to keep the user logged in while they are active)
    // If token has less than 15 minutes left, issue a fresh one
    //
    // const now = Math.floor(Date.now() / 1000)
    // if (decoded.exp - now < 15 * 60) {
    //   freshToken(req, res)
    // }
    //
    // END OF REFRESH TOKEN - OPTION 1


    // NEXT -> Status Update (end)
    next()
  })
}