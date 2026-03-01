import express from 'express';
import { statusJWT, statusUUID } from '../controllers/auth-controllers.js'
import { checkJWT } from '../helper-functions/checkJWT.js'
import { checkUUID } from '../helper-functions/checkUUID.js'
import { deleteUUID } from '../helper-functions/deleteUUID.js'
import { freshUUID } from '../helper-functions/createUUID.js'
import { freshJWT } from '../helper-functions/createJWT.js'


const router = express.Router();

// ADVANCED - NEW
// (added cache details to header
//   - NO STORING anywhere in the route (RE: remember CDNs often store info in caches))


// IS THE USER STILL LOGGED IN (with the functioning passport)?
// (and ready to go)
router.get('/auth/checkJWT', checkJWT, statusJWT)


// DOES THE USER AT LEAST HAVE THE PASSPORT SAVED IN A SAFETY-DEPOSIT BOX FOR QUICK ACCESS?
// (add a fresh stamp 'valid for 30 days of use' ... THEN 'HAND IT TO THEM')
router.post('/auth/checkUUID', checkUUID, deleteUUID, freshUUID, freshJWT, statusUUID)



export default router