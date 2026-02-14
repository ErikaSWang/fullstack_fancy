import express from 'express';
const router = express.Router();
import { sendErrorMessage } from '../controllers/errorControllers.js';

router.use('/404Error', sendErrorMessage);

export default router;