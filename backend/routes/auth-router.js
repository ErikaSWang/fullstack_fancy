import express from 'express';
import { checkAuth } from '../custom-middleware/checkToken.js'


const router = express.Router();

// ADVANCED - NEW
// (added cache details to header
//   - NO STORING anywhere in the route (RE: remember CDNs often store info in caches))

// "AM I STILL LOGGED IN?" CHECK
// 200 + username means yes, 401 means no (requireAuth handles the 401)
router.get('/auth/check', checkAuth, (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.status(200).json({ username: req.user.username })
})




export default router