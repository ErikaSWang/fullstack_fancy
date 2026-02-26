import jwt from 'jsonwebtoken'
import redis from '../models/redis-cache.js'



// BLACKLIST JWT ('to 'LOG OUT')

export async function blacklistToken(req, res) {

   // requireAuth already verified the cookie, so req.cookies.token is guaranteed valid
  const token = req.cookies.token

  // Decode the token to get the expiry time
  const decoded = jwt.decode(token)
  const secondsUntilExpiry = decoded.exp - Math.floor(Date.now() / 1000)

  // Add the token to the Redis blacklist with an expiry time (for automatic cleanup)
  await redis.set(`blacklist:${token}`, '1', { ex: secondsUntilExpiry })

  // Clear the cookie from the browser
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })

}