import express from 'express';
import {
  onboardOrganization,
  getCurrentOrg,
  updateBranding,
  getNetworkStatus,
  updateNetworkStatus,
} from '../controllers/orgController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/onboard', onboardOrganization);
router.get('/current', protect, getCurrentOrg);
router.patch('/branding', protect, requireRole('Manager'), updateBranding);
router.get('/network-status', protect, getNetworkStatus);
router.patch('/network-status', protect, requireRole('Manager'), updateNetworkStatus);

export default router;
