import jwt from 'jsonwebtoken'



// CREATE JWT (and COOKIE STORE)
// (an authorization token is like the Movenpick Marche open tab, or a passport)
// (personal ID that shows you have been granted access to be served)

// jwt.sign() STORES USER DATA, TO AVOID MULTIPLE DATABASE CALLS (like an open tab)
  // (best to keep the duration short, and refresh it?)

// ADVANCED - NEW
// (we are now adding cookies, because otherwise a JWT in localstorage would be visible to the public)
// (big security leak!)

export function freshJWT(req, res, next) {

  // THESE ARE THE VARIABLES WE PASSED FROM THE LAST FUNCTION
  const { id, username, role } = req.user

  // USE THE JWT PACKAGE TO CREATE A TOKEN
  // (uses our personal ID from .env to ensure that it was us that issued it)
  // role is included so requireRole() middleware can authorise admin routes
  // without an extra database lookup on every request
  const tokenJWT = jwt.sign(
    { id, username, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  // USE EXPRESS TO CREATE A COOKIE SECURITY BOX
  // (httpOnly means it can only be passed via the http protocl, and secure means it's HTTPS)
  // sameSite: 'lax' — sent on normal navigations, blocked on cross-site POST
  // secure: true in production so it only travels over HTTPS
  // (we need it to be able to access http in development, otherwise it'd be 'true'?)

  // NOTE: THE RES.COOKIE MEANS IT IS BEING SENT BACK TO THE FRONTEND
  // (httpOnly also means the transmission of the cookie ends in the browser, the js can't read it or do anything with it)
  res.cookie('token1', tokenJWT, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000   // 15 minutes, matches JWT expiry
  })

  // NEXT - is fresh UUID
  next()

}