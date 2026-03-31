import passport from '../config/passport.js'
import crypto from 'crypto'
import { findUserByTwitterId, findOrCreateTwitterUser } from '../models/users-models.js'


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
export function redirectGoogle(req, res, next) {
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


// C. TWITTER (manual OAuth 2.0 + PKCE — no passport, avoids vulnerable dependencies)

// STEP 1: Generate PKCE values, store verifier in short-lived cookie, redirect to Twitter
export function callTwitter(_req, res) {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')

  // Store verifier in a short-lived cookie so we can use it in the callback
  res.cookie('twitter_cv', codeVerifier, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000   // 5 minutes — just long enough for the OAuth flow
  })

  // Generate a random state value for CSRF protection (stored in cookie, verified in callback)
  const oauthState = crypto.randomBytes(16).toString('hex')
  res.cookie('twitter_state', oauthState, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: process.env.TWITTER_CALLBACK_URL,
    scope: 'tweet.read users.read',
    state: oauthState,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })

  res.redirect(`https://twitter.com/i/oauth2/authorize?${params}`)
}


// STEP 2: Twitter calls us back with a code — exchange it for a token, get the user profile
export async function verifyTwitter(req, res, next) {
  const { code, state } = req.query
  const codeVerifier = req.cookies.twitter_cv
  const storedState = req.cookies.twitter_state

  // Clear the single-use cookies
  res.clearCookie('twitter_cv')
  res.clearCookie('twitter_state')

  // Verify state to prevent CSRF attacks
  if (!state || state !== storedState) {
    return res.redirect(process.env.TWITTER_SUCCESS_REDIRECT || '/')
  }

  // Exchange the code for an access token
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.TWITTER_CALLBACK_URL,
      code_verifier: codeVerifier
    })
  })

  const tokenData = await tokenRes.json()
  // console.log('Twitter token response:', JSON.stringify(tokenData))
  if (!tokenData.access_token) return res.redirect(process.env.TWITTER_SUCCESS_REDIRECT || '/')

  // Use the access token to get the user's Twitter profile
  const profileRes = await fetch('https://api.twitter.com/2/users/me?user.fields=id,name,username', {
    headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
  })

  const profileData = await profileRes.json()
  // console.log('Twitter profile response:', JSON.stringify(profileData))
  if (!profileData.data) return res.redirect(process.env.TWITTER_SUCCESS_REDIRECT || '/')
  const { id, username } = profileData.data

  // Find or create the user in our database
  let user = await findUserByTwitterId(id)
  if (!user) user = await findOrCreateTwitterUser(id, username)

  // Pass the user to freshJWT and freshUUID (same as Google/Facebook)
  req.user = user
  next()
}


// STEP 3: Redirect back to the frontend after successful sign-in
export function redirectTwitter(_req, res) {
  res.redirect(process.env.TWITTER_SUCCESS_REDIRECT || '/')
}


