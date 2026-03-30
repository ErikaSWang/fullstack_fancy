import jwt from 'jsonwebtoken'
import redis from '../providers/redis-cache.js'


// CREATE JWT (and COOKIE STORE)
// CHECK JWT
//    - VALID? (not expired)
//    - VALID? (user logged out, and token was 'blacklisted' since it hasn't expired yet)
//    (- returns id, username if still valid)
// BLACKLIST JWT ('to 'LOG OUT')



// CREATE JWT (and COOKIE STORE)
// (an authorization token is like the Movenpick Marche open tab, or a driver's license)
// (a unique ID that shows you have been granted access to be served)

// jwt.sign() STORES USER DATA, TO AVOID MULTIPLE DATABASE CALLS (like an open tab)
  // (best to keep the duration short, and refresh it?)

// ADVANCED - NEW
// (we are now adding cookies, because otherwise a JWT in localstorage would be visible to the public)
// (big security leak!)

export function freshToken(req, res) {

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

}



// CHECK JWT

// Three steps to check if JWT Token is valid:
//   1. Is there a token?
//   2. Has the user logged out (and token placed in expired bucket (in REDIS))?
//   3. Verify the token (?? What does this involve?)


// ADVANCED - NEW 
// JWT IS NOW STORED IN A COOKIE (prev localstorage, in the browser))

export async function checkAuth(req, res, next) {

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

    if (err) return res.status(401).json({ message: 'Invalid or expired token' })
    // b) WILL RETURN USERNAME IF VALID?
    req.user = decoded


    // ADVANCED - NEW

    // BEGINNING OF REFRESH TOKEN - OPTION 1
    // (The only extra code needed to keep the user logged in while they are active)
    // If token has less than 15 minutes left, issue a fresh one
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp - now < 15 * 60) {
      freshToken(req, res)
    }
    // END OF REFRESH TOKEN - OPTION 1


    next()
  })
}



// BLACKLIST JWT ('to 'LOG OUT')

export async function blacklistToken(req, res) {

   // requireAuth already verified the cookie, so req.cookies.token is guaranteed valid
  const token = req.cookies.token

  // Decode the token to get the expiry time
  const decoded = jwt.decode(token)
  const secondsUntilExpiry = decoded.exp - Math.floor(Date.now() / 1000)

  // Add the token to the Redis blacklist with an expiry time (for automatic cleanup)
  await redis.set(`blacklist:${token}`, '1', { ex: secondsUntilExpiry })

  // Clear the cookie from the browser
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })

}
