import express from 'express';
const router = express.Router();


// ADVANCED - NEW
// (added cache details to header - ask to store, to avoid repeat calls
//    - public info
//    - expiration a balance between avoiding repeats vs wasting cache space)
// Honestly - could just have this as a <div> on the frontend - but this was for learning
router.get('/welcome', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60')
  res.status(200).json({ message: 'Welcome to the full stack app!' })
});

export default router;

