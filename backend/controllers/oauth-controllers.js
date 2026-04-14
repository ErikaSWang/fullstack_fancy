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
  passport.authenticate('google', { failureRedirect: process.env.GOOGLE_SUCCESS_REDIRECT || '/', session: false })(req, res, next)
}


// This redirects the user back to the front page, after successful signin using Google Sign-in
//
export function redirectGoogle(req, res, _next) {
  res.redirect(process.env.GOOGLE_SUCCESS_REDIRECT || '/')
}


// B. FACEBOOK

// This opens the window for Facebook Sign-in
//
export function callFacebook(req, res, next) {
  passport.authenticate('facebook', { scope: ['email'], session: false })(req, res, next)
}

// This verifies the user Facebook Sign-in
//
export function verifyFacebook(req, res, next) {
  passport.authenticate('facebook', { failureRedirect: process.env.FACEBOOK_SUCCESS_REDIRECT || '/', session: false })(req, res, next)
}

// This redirects the user back to the front page, after successful signin using Facebook Sign-in
//
export function redirectFacebook(_req, res, _next) {
  res.redirect(process.env.FACEBOOK_SUCCESS_REDIRECT || '/')
}

