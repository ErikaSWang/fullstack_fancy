import express from 'express'
import { statusHealth } from '../controllers/health-controllers.js'

const router = express.Router()

/*
// COOL LOGGING FUNCTION THAT HELPED US DIAGNOSE WHAT WAS WRONG WITH THE PROGRAM!
// (either comment out the real function, or comment out this logger)
// (ONE OR THE OTHER)

const log = (label) => (_req, _res, next) => { console.log(`[DEBUG] health check reached: ${label}`); next() }

router.post('/health',
  log('checkJWT'), checkJWT,
  log('statusHealth'), statusHealth
)
*/

router.get('/health', statusHealth)

export default router;