import express from 'express';
import {
  getNotifications,
  markNotificationRead,
} from '../controllers/notificationController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireRole('Agent', 'Manager'));

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;
