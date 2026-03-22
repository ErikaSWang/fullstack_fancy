import express from 'express'
import passport from '../config/passport.js'
import { callGoogle, verifyGoogle, redirectGoogle } from '../controllers/oauth-controllers.js'
import { freshJWT } from '../helper-functions/createJWT.js'
import { freshUUID } from '../helper-functions/createUUID.js'

const router = express.Router()


// STEP 1: Redirect user to Google's login page
router.get('/oauth/google', callGoogle)


// STEP 2: Google redirects back here after the user approves
// Passport verifies the response, finds/creates the user, and puts them on req.user
// Then we issue our own JWT + UUID cookies (same as regular login)
// And redirect back to the homepage
router.get('/oauth/google/callback', verifyGoogle, freshJWT, freshUUID, redirectGoogle)


export default router
