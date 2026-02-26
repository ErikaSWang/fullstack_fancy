import express from 'express'
import { gatherInput, gatherOutput } from '../controllers/content-controllers.js'
import { checkAuth } from '../custom-middleware/checkToken.js'
import { validateInput, validationLogging } from '../custom-middleware/input-validators.js'


// THESE ARE 'PROTECTED ROUTES' - only those who have signed in have access to these features


const router = express.Router()


// THIS IS A CHAIN OF ASYNC/AWAIT FUNCTIONS
//    - checkAuth: see 'jwt-authorization-check.js'
//    - gatherInput: see 'content-controllers.js'

router.post('/saveContent', checkAuth, commentSlowDown, commentLimiter, validateInput, validationLogging, gatherInput)

router.get('/getSavedContent', checkAuth, gatherOutput)

export default router
