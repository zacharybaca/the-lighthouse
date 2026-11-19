/*
 * Model: Invoice (Transactions & Proration)
 *
 * Attributes:
 * - orgId:          ObjectId, ref: 'Organization', required (tenant isolation)
 * - subscriberId:   ObjectId, ref: 'Subscriber', required
 * - amount:         Number, required, min: 0
 * - status:         String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending'
 * - issueDate:      Date, default: Date.now
 * - isProrated:     Boolean, default: false (used by First Bill Proration Visualizer)
 * - prorationStart: Date (activation date, if isProrated is true)
 * - prorationEnd:   Date (billing cycle end date, if isProrated is true)
 *
 * Schema Options:
 * - { timestamps: true }
 */

import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscriber',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Pending',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    isProrated: {
      type: Boolean,
      default: false,
    },
    prorationStart: {
      type: Date,
    },
    prorationEnd: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Fast lookup for a subscriber's billing history, newest first
invoiceSchema.index({ orgId: 1, subscriberId: 1, issueDate: -1 });

export default mongoose.model('Invoice', invoiceSchema);
