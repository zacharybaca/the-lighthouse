import express from 'express';
import {
  getSubscribers,
  createSubscriber,
  generateSupportPin,
  verifySupportPin,
} from '../controllers/subscriberController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, requireRole('Agent', 'Manager'), getSubscribers);
router.post('/', protect, requireRole('Agent', 'Manager'), createSubscriber);
router.post('/support-pin', protect, requireRole('Subscriber'), generateSupportPin);
router.post('/:id/verify-pin', protect, requireRole('Agent', 'Manager'), verifySupportPin);

export default router;
