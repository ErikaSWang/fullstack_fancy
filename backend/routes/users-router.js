import express from 'express'
import { signup, login, logout } from '../controllers/users-controllers.js'
import { requireAuth } from '../controllers/jwt-authorization-check.js'
import { loginLimiter, signupLimiter, loginSlowDown } from '../controllers/rate-limiters.js'
import { validateSignup, validateLogin, handleValidationErrors } from '../controllers/input-validators.js'


const router = express.Router()


// GET/POST ARE SET HERE, ALONG WITH THE ROUTE ->
// -> FOLLOWED BY A CHAIN OF FUNCTIONS THAT COMPLETE THE TASK


// TO CREATE A NEW ACCOUNT
// POST /api/users/signup ->
// -> function signupLimiter is in rate-limiters.js ->
// -> function signup is in users-controllers.js
router.post('/users/signup', signupLimiter, validateSignup, handleValidationErrors, signup)


// TO LOG INTO AN EXISTING ACCOUNT
// POST /api/users/login ->
// -> function loginSlowDown is in rate-limiters.js ->
// -> function loginLimiter is in rate-limiters.js ->
// -> function login is in users-controllers.js
router.post('/users/login', loginSlowDown, loginLimiter, validateLogin, handleValidationErrors, login)


// TO LOG OUT
// POST /api/users/logout ->
// -> function requireAuth is in jwt-authorization-check.js ->
// -> function logout is in users-controllers.js
router.post('/users/logout', requireAuth, logout)



// THIS IS THE ROUTE FOR THE YELLOW 'CHECK JWT' BUTTON
// (It is an example of a protected route that only returns the username if the JWT is valid)
router.get('/users/profile', requireAuth, (req, res) => {
  res.status(200).json({ message: `Hello ${req.user.username}, your token is valid!` })
})


export default router
