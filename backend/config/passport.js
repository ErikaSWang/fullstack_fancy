import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { findUserByGoogleId, findOrCreateGoogleUser, findUserByFacebookId, findOrCreateFacebookUser } from '../models/users-models.js'

const googleCallbackURL = process.env.NODE_ENV === 'production'
  ? 'https://fullstack-fancy.vercel.app/api/oauth/google/callback'
  : 'http://localhost:3000/api/oauth/google/callback'

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

      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }
))

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

export default passport
