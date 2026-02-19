import express from 'express'
import { data } from '../controllers/data-controllers.js'
import { requireAuth } from '../controllers/auth-middleware.js'

const router = express.Router()

router.post('/data', requireAuth, data)

export default router
