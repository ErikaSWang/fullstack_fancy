import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { findUserByGoogleId, findOrCreateGoogleUser } from '../models/users-models.js'

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
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

export default passport
