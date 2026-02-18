import jwt from 'jsonwebtoken'

// Protects any route it is applied to
// If the token is missing or invalid, the request stops here with a 401
// If valid, it attaches the decoded user data to req.user and calls next()
export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]  // expects: "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'No token provided' })

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' })
    req.user = decoded  // { id, username } — now available in the route handler
    next()
  })
}
