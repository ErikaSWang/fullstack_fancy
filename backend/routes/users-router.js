import express from 'express'
import { signup, login } from '../controllers/users-controllers.js'

const router = express.Router()


// TO CREATE A NEW ACCOUNT
// POST /api/users/signup
// (gets forwarded next to the users-controller ->)
router.post('/signup', signup)


// TO LOG INTO AN EXISTING ACCOUNT
// POST /api/users/login
// (gets forwarded next to the users-controller ->)
router.post('/login', login)


export default router
