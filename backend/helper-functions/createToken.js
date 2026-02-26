import jwt from 'jsonwebtoken'



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