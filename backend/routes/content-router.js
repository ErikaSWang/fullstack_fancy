import express from 'express'
import { checkJWT } from '../helper-functions/checkJWT.js'
import { commentSlowDown, commentLimiter } from '../custom-middleware/rate-limiters.js'
import { validateInput, validationLogging } from '../custom-middleware/input-validators.js'
import { gatherInput, gatherOutput } from '../controllers/content-controllers.js'
import { statusAdd, statusGet } from '../controllers/content-controllers.js'




// THESE ARE 'PROTECTED ROUTES' - only those who have signed in have access to these features


const router = express.Router()


// THIS IS A CHAIN OF ASYNC/AWAIT FUNCTIONS
//    - checkAuth: see 'jwt-authorization-check.js'
//    - gatherInput: see 'content-controllers.js'

router.post('/saveContent', checkJWT, commentSlowDown, commentLimiter, validateInput, validationLogging, gatherInput, statusAdd)

router.get('/getSavedContent', checkJWT, gatherOutput, statusGet)

export default router
