import express from 'express'
import passport from '../config/passport.js'
import { freshJWT } from '../helper-functions/createJWT.js'
import { freshUUID } from '../helper-functions/createUUID.js'

const router = express.Router()


// STEP 1: Redirect user to Google's login page
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))


// STEP 2: Google redirects back here after the user approves
// Passport verifies the response, finds/creates the user, and puts them on req.user
// Then we issue our own JWT + UUID cookies (same as regular login)
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  freshJWT,
  freshUUID,
  (req, res) => {
    // Redirect to the frontend home page with cookies set
    res.redirect(process.env.GOOGLE_SUCCESS_REDIRECT || '/')
  }
)


export default router
