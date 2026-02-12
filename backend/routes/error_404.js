import express from 'express';
const router = express.Router();

router.get('/error', (req, res) => {
  res.send('Error 404: Page not found');
});

export default router;