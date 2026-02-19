import jwt from 'jsonwebtoken'
import redis from '../models/redis-cache.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]  // expects: "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'No token provided' })

  // Check if this token has been blacklisted (i.e. the user logged out)
  const blacklisted = await redis.get(`blacklist:${token}`)
  if (blacklisted) return res.status(401).json({ message: 'Token has been revoked — please log in again' })

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' })
    req.user = decoded
    next()
  })
}
