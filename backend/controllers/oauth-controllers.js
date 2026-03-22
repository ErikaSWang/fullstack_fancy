import passport from '../config/passport.js'


// A. GOOGLE

// This opens the window for Google Sign-in
//
export function callGoogle(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
}

// This verifies the user Google Sign-in
//
export function verifyGoogle(req, res, next) {
  passport.authenticate('google', { failureRedirect: '/login', session: false })(req, res, next)
}


// This redirects the user back to the front page, after successful signin using Google Sign-in
//
export function redirectGoogle(req, res, next) {
  res.redirect(process.env.GOOGLE_SUCCESS_REDIRECT || '/')
}


