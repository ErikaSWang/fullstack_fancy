import { randomUUID } from 'crypto'
import redis from '../providers/redis-cache.js'


// CREATE A 7-DAY 'ROLLING' TOKEN (to avoid multiple calls to the database for user info)
//    (JWTs are self-contained, but can't be deleted)
//    (These stay in the back, but kept getting deleted and reissued)


// This token gives them access to a hotel pool, but you need a fresh pass (short expiry) every time
//    1. The 36-character ID is like their hotel key (YOU HOLD ONTO IT, expires in 7 days)

// EXCEPT HERE,
// 7 DAY EXPIRY IS CONSTANTLY GETTING REFRESHED, EVERY TIME THE USER TAKES ACTION
//  - visiting site
//  - logging in
//  - adding a comment
//  - getting comments


const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60        // for Redis TTL
const SEVEN_DAYS_MS      = SEVEN_DAYS_SECONDS * 1000 // for cookie maxAge


export async function freshUUID(req, res, next) {

  // DATA PASSED FROM PREVIOUS STEP, checkUUID (valid returns user data)
  const { id, username } = req.user
  
  const tokenUUID = randomUUID()

  // STORE IN REDIS: key → user info, auto-deletes after 30 days
  await redis.set(
    `userID:${tokenUUID}`,
    JSON.stringify({ id, username }),
    { ex: SEVEN_DAYS_SECONDS }
  )

  // SET AS A SEPARATE HTTPONLY COOKIE
  // path: '/api/auth/checkUUID' means the browser ONLY sends this cookie to that one endpoint?
  // (never attached to other requests = extra security)

  // NOTE: THE RES.COOKIE MEANS IT IS BEING SENT BACK TO THE FRONTEND
  // (httpOnly also means the transmission of the cookie ends in the browser, the js can't read it or do anything with it)
  res.cookie('token2', tokenUUID, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SEVEN_DAYS_MS,
    path: '/api'
  })


  // NEXT - confirmation to frontend, with username (final step)
  next()

}
