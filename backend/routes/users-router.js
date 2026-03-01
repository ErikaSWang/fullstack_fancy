import express from 'express'
import { loginLimiter, signupLimiter, loginSlowDown } from '../custom-middleware/rate-limiters.js'
import { validateSignup, validateLogin, validationLogging } from '../custom-middleware/input-validators.js'
import { submitInfo, statusSignup, confirmInfo, statusLogin, statusLogout} from '../controllers/users-controllers.js'
import { freshJWT } from '../helper-functions/createJWT.js'
import { freshUUID } from '../helper-functions/createUUID.js'
import { checkJWT } from '../helper-functions/checkJWT.js'
import { blacklistJWT } from '../helper-functions/blacklistJWT.js'
import { checkUUID } from '../helper-functions/checkUUID.js'
import { deleteUUID } from '../helper-functions/deleteUUID.js'



const router = express.Router()


// GET/POST ARE SET HERE, ALONG WITH THE ROUTE ->
// -> FOLLOWED BY A CHAIN OF FUNCTIONS THAT COMPLETE THE TASK


// TO CREATE A NEW ACCOUNT
// POST /api/users/signup ->
// Security Steps:
  // 1. RATE LIMITER (keeps track of # of attempts - clickjacking?)
  // 2. INPUT VALIDATOR/SANITIZER (looks for suspicious hacking attempts - script injections)
// Then actual signup (with more error checks)

// -> function signupLimiter is in rate-limiters.js ->
// ADVANCED - NEW
// -> function validateSignup is in input-validators.js ->
// -> function signup is in users-controllers.js
router.post('/users/signup', signupLimiter, validateSignup, validationLogging, submitInfo, statusSignup)


// TO LOG INTO AN EXISTING ACCOUNT
// POST /api/users/login ->
// Security Steps:
  // 1.a) LOGIN LIMITER (slows down multiple attempts)
  // 1.b) RATE LIMITER (keeps track of # of failed attempts - brute force attacks)
  // 2. INPUT VALIDATOR/SANITIZER (looks for suspicious hacking attempts - script injections)
// Then actual login (with more error checks)


// -> function loginSlowDown is in rate-limiters.js ->
// -> function loginLimiter is in rate-limiters.js ->
// ADVANCED - NEW
// -> function validateLogin is in input-validators.js ->
// -> function login is in users-controllers.js
router.post('/users/login', loginSlowDown, loginLimiter, validateLogin, validationLogging, confirmInfo, freshJWT, freshUUID, statusLogin)


// TO LOG OUT
// POST /api/users/logout ->
// -> function checkAuth is in jwt-authorization-check.js ->
// -> function logout is in users-controllers.js
router.post('/users/logout', checkJWT, blacklistJWT, checkUUID, deleteUUID, statusLogout)



// THIS IS THE ROUTE FOR THE YELLOW 'CHECK JWT' BUTTON
// (It is an example of a protected route that only returns the username if the JWT is valid)
router.get('/users/profile', checkJWT, (req, res) => {
  res.status(200).json({ message: `Hello ${req.user.username}, your token is valid!` })
})



export default router
