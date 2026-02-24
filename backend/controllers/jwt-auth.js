import jwt from 'jsonwebtoken'
import redis from '../models/redis-cache.js'


// GATEKEEPER USES JWT TO CHECK IF USER IS LOGGED IN
// - RETURNS USER PROFILE 


// REDIS HAS THE 'LOGGED OUT' TOKENS BUCKET OF BLACKLISTED (not yet expired)
// JWT 

// Three steps to check if JWT Token is valid:
//   1. Is there a token?
//   2. Has the user logged out (and token placed in expired bucket)?
//   3. Verify the token (?? What does this involve?)



export async function requireAuth(req, res, next) {


  // 1. Gets the token from the httpOnly cookie
  //    (browser sends it automatically — JS can't read or steal it)
  const token = req.cookies.token


  // 1.b) ERROR CHECK — no cookie means not logged in
  if (!token) return res.status(401).json({ message: 'No token provided' })


  // 2. IF TOKEN, HAS IT BEEN ADDED TO 'LOGGED OUT' BUCKET?
  //    (shouldn't happen, since the user can't access this route without a live token)
  //    (BLACKLIST IS ON REDIS)
  const blacklisted = await redis.get(`blacklist:${token}`)

  if (blacklisted) return res.status(401).json({ message: 'Token has been revoked — please log in again' })

    
  // 3. JWT VERIFIES THAT YOU GAVE THE AUTHORIZATION
  //    (not just some bootleg copy somebody is attempting to hack into the system?)
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // a) err - if something goes wrong
    if (err) return res.status(401).json({ message: 'Invalid or expired token' })
    // b) WILL RETURN USERNAME IF VALID?
    req.user = decoded
    next()
  })
}
