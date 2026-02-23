import express from 'express';
const router = express.Router();


router.get('/welcome', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60')
  res.status(200).json({ message: 'Welcome to the full stack app!' })
});

export default router;

