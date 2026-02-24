import jwt from 'jsonwebtoken'
import redis from '../models/redis-cache.js'


// CREATE JWT (and COOKIE STORE)
// CHECK JWT (if 'LOGGED OUT' and 'blacklisted')
// USE JWT TO CHECK IF USER IS LOGGED IN
// - CHECK RETURNS USER PROFILE 



// CREATE JWT (and COOKIE STORE)
// (an authorization token is like the Movenpick Marche open tab, or a driver's license)
// (a unique ID that shows you have been granted access to be served)

// jwt.sign() STORES USER DATA, TO AVOID MULTIPLE DATABASE CALLS (like an open tab)
  // (best to keep the duration short, and refresh it?)

// ADVANCED - NEW
// (we are now adding cookies, because otherwise a JWT in localstorage would be visible to the public)
// (big security leak!)

export async function createToken(req, res) {

  // THESE ARE THE VARIABLES WE PASSED FROM THE LAST FUNCTION
  const { id, username } = req.user

  // USE THE JWT PACKAGE TO CREATE A TOKEN
  const token = jwt.sign(
    { id, username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  // USE EXPRESS TO CREATE A COOKIE SECURITY BOX
  // Set token as an httpOnly cookie (JS can't read it — XSS-safe)
  // sameSite: 'lax' — sent on normal navigations, blocked on cross-site POST
  // secure: true in production so it only travels over HTTPS

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000   // 1 hour, matches JWT expiry
  })

  res.status(200).json({ message: `Welcome back, ${username}!`, username })

}



// REDIS HAS THE 'LOGGED OUT' TOKENS BUCKET OF BLACKLISTED (not yet expired)
// JWT 

// Three steps to check if JWT Token is valid:
//   1. Is there a token?
//   2. Has the user logged out (and token placed in expired bucket)?
//   3. Verify the token (?? What does this involve?)


// ADVANCED - NEW 
// JWT IS NOW STORED IN A COOKIE (prev localstorage, in the browser))

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
