import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { findUserByGoogleId, findOrCreateGoogleUser, findUserByFacebookId, findOrCreateFacebookUser } from '../models/users-models.js'

// oAuth solves several problems that homemade signup/logins have:
    // Gets rid of the need for input sanitization, because there's no input
        // (Google, Facebook have taken care of the sanitization, rate-limiting, reCaptcha, email verification already)
    // Gets rid of the need for password hashing, because we don't get the password
    // Moves the exchange of user profile info to the backend to take it out of the browser completely

    // USES SEVERAL CALLS BETWEEN OUR APP AND GOOGLE:
      // 1. USER PRESSES LOGIN W GOOGLE/FACEBOOK BUTTON
        // Frontend → Backend:  GET /oauth/google                                             (browser request)
  // * >     callGoogle() TRIGGERED!!
  //           - GOOGLESTRATEGY USED TO GET CLIENT-ID, CALLBACK URL
  //           - BACKEND CRAFTS A URL, INCLUDING THOSE AS PARAMS
  //           - includes it in the response back to the frontend ...
        // Backend → Frontend -> Google:  302                                                 (server response & browser redirect WITH A REQUEST)
          // (BACKEND RESPONSE -> REROUTES (redirects) TO A GOOGLE REQUEST ...
          // (Backend -> Google: GET accounts.google.com?client_id=...&redirect_uri=..)                          (browser request, user sees this)
        // Google → Frontend:       200 OK, here is the permission page HTML                  (server response)
      // 2. USER SEE THE "Sign in with Google" WINDOW POP UP
      // 3. USER CLICKS APPROVE  
        // Frontend → Google ('yes!')                                                         (browser request)                              
        // Google → Frontend -> Backend:  302 redirect to /callback                           (server response & browser redirect WITH A REQUEST)
          // GOOGLE RESPONSE TO FRONTEND -> REROUTES (redirects) TO BACKEND
          // (using the route of the callback url ...
          // (WITH AN AUTH TOKEN ADDED AS A PARAM: /oauth/google/callback?code=xyz 
          // (Frontend -> Backend: GET /oauth/google/callback?code=xyz
  // * >     verifyGoogle() TRIGGERED!!
      // Backend → Google:   POST WITH AUTH TOKEN, CLIENT SECRET IN BODY                    (SERVER REQUEST)
      // Google → Backend:   user profile                                                   (SERVER RESPONSE)
          // WE CONTACT THE DATABASE HERE
          // WE GENERATE THE ACCESS TOKENS HERE
      // Backend -> Frontend: approval granted, page changes from login to logged in!

//RE: GET USE PARAMS TO PASS DATA
//    POST USES THE BODY

const googleCallbackURL = process.env.NODE_ENV === 'production'
  ? 'https://fullstack-fancy.vercel.app/api/oauth/google/callback'
  : 'http://localhost:3000/api/oauth/google/callback'

// REDIRECT NEEDS TO BE CUSTOMIZED FOR PRODUCTION
const homepageRedirect = process.env.NODE_ENV === 'production'
  ? 'https://fullstack-fancy.vercel.app'
  : 'http://localhost:5000'


// A. GOOGLE
      // OAUTH 2.0 IS A 2-STEP PROCESS, THAT USES A HELPER FUNCTION
      // 1. callGoogle()
      // 2. verifyGoogle()
      // + HELPER FUNCTION: GoogleStrategy (USED BY BOTH)
      // 

// + HELPER FUNCTION HERE, that does the following:
// (1) FOR callGoogle():
       // IT USES THE:
            // a. clientID
            // b. callbackURL
            // TO CREATE A REQUEST URL, THAT INCLUDES THEM AS PARAMS
            // (like this: https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/oauth/google/callback&scope=profile_email&response_type=code
// (GOOGLE VERIFIES BOTH, AS WELL AS THE USER)
// (AND THEN SENDS AN API 'REDIRECT' TO THE 'RETURN' URL WE GAVE THEM ('the callback'))
// (WITH AN AUTHENTICATION TOKEN ADDED TO IT)
// (like this: http://localhost:3000/api/oauth/google/callback?code=xyz123&state=...
//
// (NB. Claude says it can't be considered a response because responses contain JSON - and this doesn't)

// (2) FOR verifyGoogle():
      // a. THIS IS WHERE YOU ADD INSTRUCTIONS FOR WHAT TO DO WITH THE RESPONSE DATA (fr GOOGLE)
//
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackURL,
    state: false,   // stateless backend — no session to store the CSRF state parameter
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if we already have this Google user
      let user = await findUserByGoogleId(profile.id)

      if (!user) {
        // First time signing in with Google — create a new account
        const email = profile.emails?.[0]?.value
        const displayName = profile.displayName
        user = await findOrCreateGoogleUser(profile.id, displayName, email)
      }

      // ADD SOMETHING HERE TO DIFFERENTIATE THE WELCOMES FOR NEW/OLD USERS

      // done is passport.js's equivalent to next()
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }
))

// This opens a new window for the Google signin
//
export function callGoogle(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
}

// Google verification
//(failureRedirect only happens if the user cancels the login
// or if something goes wrong with the authentication process)
//
export function verifyGoogle(req, res, next) {
  passport.authenticate('google', { failureRedirect: homepageRedirect || '/', session: false })(req, res, next)
}






// B. FACEBOOK

// This opens a new window for the Facebook signin
//
export function callFacebook(req, res, next) {
  passport.authenticate('facebook', { scope: ['email'], session: false })(req, res, next)
}

// Facebook verification
//(failureRedirect only happens if the user cancels the login
// or if something goes wrong with the authentication process)
//
export function verifyFacebook(req, res, next) {
  passport.authenticate('facebook', { failureRedirect: homepageRedirect || '/', session: false })(req, res, next)
}

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await findUserByFacebookId(profile.id)

      if (!user) {
        const email = profile.emails?.[0]?.value
        const displayName = profile.displayName
        user = await findOrCreateFacebookUser(profile.id, displayName, email)
      }

      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }
))