import express from 'express'
import { signup, login } from '../controllers/usersControllers.js'

const router = express.Router()

// POST /api/users/signup  — create a new account
router.post('/signup', signup)

// POST /api/users/login   — log in with existing account
router.post('/login', login)

export default router
