import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Subscriber from '../models/Subscriber.js';

// GET /api/invoices
export const getInvoices = async (req, res) => {
  try {
    const { orgId, id, role } = req.user;
    const filter = { orgId };

    if (role === 'Subscriber') {
      filter.subscriberId = id;
    } else if (req.query.subscriberId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.subscriberId)) {
        return res.status(400).json({ message: 'Invalid subscriberId format.' });
      }
      filter.subscriberId = req.query.subscriberId;
    }

    const invoices = await Invoice.find(filter)
      .populate('subscriberId', 'firstName lastName email')
      .sort({ issueDate: -1 });

    return res.status(200).json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    return res.status(500).json({ message: 'Server error retrieving invoices.' });
  }
};

// POST /api/invoices/:id/refund (Agent / Manager)
export const refundInvoice = async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid invoice ID.' });
    }

    const invoice = await Invoice.findOne({ _id: id, orgId });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    if (invoice.status !== 'Paid') {
      return res.status(400).json({
        message: `Only Paid invoices can be refunded (current status: ${invoice.status}).`,
      });
    }

    const subscriber = await Subscriber.findOne({ _id: invoice.subscriberId, orgId });
    if (!subscriber) {
      return res.status(404).json({ message: 'Associated subscriber not found.' });
    }

    // Credit the subscriber's balance by the refunded invoice amount
    subscriber.accountBalance = Number((subscriber.accountBalance - invoice.amount).toFixed(2));
    await subscriber.save();

    // Update invoice status (ensure 'Pending' or add 'Refunded' to Invoice.js enum if desired)
    invoice.status = 'Pending';
    await invoice.save();

    return res.status(200).json({
      message: `Refund of $${invoice.amount.toFixed(2)} processed.`,
      invoice,
      accountBalance: subscriber.accountBalance,
    });
  } catch (error) {
    console.error('Refund invoice error:', error);
    return res.status(500).json({ message: 'Server error processing refund.' });
  }
};
