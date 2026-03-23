import express from 'express'
import { callGoogle, verifyGoogle, redirectGoogle, callFacebook, verifyFacebook, redirectFacebook, callTwitter, verifyTwitter, redirectTwitter } from '../controllers/oauth-controllers.js'
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


// STEP 1: Redirect user to Facebook's login page
router.get('/oauth/facebook', callFacebook)

// STEP 2: Facebook redirects back here after the user approves
router.get('/oauth/facebook/callback', verifyFacebook, freshJWT, freshUUID, redirectFacebook)


// STEP 1: Redirect user to Twitter's login page
router.get('/oauth/twitter', callTwitter)

// STEP 2: Twitter redirects back here after the user approves
router.get('/oauth/twitter/callback', verifyTwitter, freshJWT, freshUUID, redirectTwitter)


export default router
