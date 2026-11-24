import express from 'express';
import { upgradeSubscription } from '../controllers/subscriptionController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upgrade', protect, requireRole('Subscriber'), upgradeSubscription);

export default router;
