import jwt from 'jsonwebtoken'
import redis from '../providers/redis-cache.js'



// BLACKLIST JWT ('to 'LOG OUT')

export async function blacklistJWT(req, res, next) {

  // requireAuth already verified the cookie, so req.cookies.token is guaranteed valid
  const tokenJWT = req.cookies.token1

  // Decode the token to get the expiry time
  const decodedJWT = jwt.decode(tokenJWT)
  const secondsUntilExpiry = decodedJWT.exp - Math.floor(Date.now() / 1000)

  // Add the token to the Redis blacklist with an expiry time (for automatic cleanup)
  await redis.set(`blacklist:${tokenJWT}`, '1', { ex: secondsUntilExpiry })

  // Clear the access token cookie from the browser
  res.clearCookie('token1', {
    httpOnly: true, 
    sameSite: 'lax', 
    secure: process.env.NODE_ENV === 'production'
  })

  // NEXT - check UUID, and delete that too
  next()

}