import express from 'express';
import { getPlans, createPlan, updatePlan } from '../controllers/planController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPlans);
router.post('/', protect, requireRole('Manager'), createPlan);
router.patch('/:id', protect, requireRole('Manager'), updatePlan);

export default router;
