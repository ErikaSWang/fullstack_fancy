import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { findUserByGoogleId, findOrCreateGoogleUser, findUserByFacebookId, findOrCreateFacebookUser } from '../models/users-models.js'


//RE: GET USE PARAMS TO PASS DATA
//    POST USES THE BODY

const googleCallbackURL = process.env.NODE_ENV === 'production'
  ? 'https://fullstack-fancy.vercel.app/api/oauth/google/callback'
  : 'http://localhost:3000/api/oauth/google/callback'

// REDIRECT NEEDS TO BE CUSTOMIZED FOR PRODUCTION
const homepageRedirect = process.env.NODE_ENV === 'production'
  ? 'https://fullstack-fancy.vercel.app'
  : 'http://localhost:5000'


// Google verification
//(failureRedirect only happens if the user cancels the login
// or if something goes wrong with the authentication process)
//
export function verifyGoogle(req, res, next) {
  passport.authenticate('google', { failureRedirect: homepageRedirect || '/', session: false })(req, res, next)
}


// Helper function
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




// B. FACEBOOK


// Facebook verification
//(failureRedirect only happens if the user cancels the login
// or if something goes wrong with the authentication process)
//
export function verifyFacebook(req, res, next) {
  passport.authenticate('facebook', { failureRedirect: homepageRedirect || '/', session: false })(req, res, next)
}


// Helper function
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