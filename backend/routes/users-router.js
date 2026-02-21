import express from 'express'
import { signup, login, logout } from '../controllers/users-controllers.js'
import { requireAuth } from '../controllers/jwt-authorization-check.js'

const router = express.Router()


// TO CREATE A NEW ACCOUNT
// POST /api/users/signup
// (gets forwarded next to the users-controller ->)
router.post('/signup', signup)


// TO LOG INTO AN EXISTING ACCOUNT
// POST /api/users/login
// (gets forwarded next to the users-controller ->)
router.post('/login', login)


// TO LOG OUT
// POST /api/users/logout
router.post('/logout', requireAuth, logout)



// THIS IS THE ROUTE FOR THE YELLOW 'CHECK JWT' BUTTON
// (It is an example of a protected route that only returns the username if the JWT is valid)
router.get('/profile', requireAuth, (req, res) => {
  res.status(200).json({ message: `Hello ${req.user.username}, your token is valid!` })
})


export default router
