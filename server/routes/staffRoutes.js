import express from 'express';
import { getStaff, createStaff, getAuditLogs } from '../controllers/staffController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireRole('Manager'));

router.get('/', getStaff);
router.post('/', createStaff);
router.get('/audit-logs', getAuditLogs);

export default router;
