import express from 'express'
import { gatherInput, gatherOutput } from '../controllers/content-controllers.js'
import { requireAuth } from '../controllers/jwt-auth.js'
import { validateInput, validationLogging } from '../controllers/input-validators.js'


const router = express.Router()


// THIS IS A CHAIN OF ASYNC/AWAIT FUNCTIONS
//    - requireAuth: see 'jwt-authorization-check.js'
//    - gatherInput: see 'content-controllers.js'

router.post('/saveContent', requireAuth, validateInput, validationLogging, gatherInput)

router.get('/getSavedContent', requireAuth, gatherOutput)

export default router
