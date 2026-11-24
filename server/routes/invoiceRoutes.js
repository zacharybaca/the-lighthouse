import express from 'express';
import { getInvoices, refundInvoice } from '../controllers/invoiceController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInvoices);
router.post('/:id/refund', protect, requireRole('Agent', 'Manager'), refundInvoice);

export default router;
