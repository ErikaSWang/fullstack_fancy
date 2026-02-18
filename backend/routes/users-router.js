import express from 'express'
import { signup, login } from '../controllers/users-controllers.js'
import { requireAuth } from '../controllers/auth-middleware.js'

const router = express.Router()


// TO CREATE A NEW ACCOUNT
// POST /api/users/signup
// (gets forwarded next to the users-controller ->)
router.post('/signup', signup)


// TO LOG INTO AN EXISTING ACCOUNT
// POST /api/users/login
// (gets forwarded next to the users-controller ->)
router.post('/login', login)


// PROTECTED ROUTE - only works if a valid JWT token is sent in the request header
// requireAuth runs first — if the token is invalid, it stops here and returns 401
router.get('/profile', requireAuth, (req, res) => {
  res.status(200).json({ message: `Hello ${req.user.username}, your token is valid!` })
})


export default router
