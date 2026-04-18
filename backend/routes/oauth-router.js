import express from 'express'
import { callGoogle, callFacebook } from '../custom-middleware/oauth-authentication.js'
import { verifyGoogle, redirectGoogle, verifyFacebook, redirectFacebook } from '../controllers/oauth-controllers.js'

import { freshJWT } from '../helper-functions/createJWT.js'
import { freshUUID } from '../helper-functions/createUUID.js'

const router = express.Router()


// oAuth 2.0 signins that use your logins for Google or Facebook to sign you in
// (convenience for the user, but you have to ask for the user data you want - and password is never shared)

// Both use the same 2-step process:
// A.
    // 1. User clicks on the sign-in with Google/Facebook button
    // 2. A window popups up for them to approve sharing of data
    // 3. IF THEY APPROVE SIGNING, GOOGLE CALLS THE API ROUTE BELOW '/oauth/google/callback'
        // (we preassigned this as the designated continuation route, where we specify further instructions)
router.get('/oauth/google', callGoogle)

// B.
    // 1. AFTER USER CLICKS APPROVE, GOOGLE SENDS BACK AN AUTHENTICATION NUMBER
          // AND WE CONTINUE ON BELOW ...
    // 2. 

// STEP 2: Google redirects back here after the user approves
// Passport verifies the response, finds/creates the user, and puts them on req.user
// Then we issue our own JWT + UUID cookies (same as regular login)
// And redirect back to the homepage
router.get('/oauth/google/callback', verifyGoogle, freshJWT, freshUUID, redirectGoogle)



// STEP 1: Redirect user to Facebook's login page
router.get('/oauth/facebook', callFacebook)

// STEP 2: Facebook redirects back here after the user approves
router.get('/oauth/facebook/callback', verifyFacebook, freshJWT, freshUUID, redirectFacebook)


export default router
