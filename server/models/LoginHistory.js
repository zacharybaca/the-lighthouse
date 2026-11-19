/*
 * Model: LoginHistory (Identity & Security Auditing)
 *
 * Attributes:
 * - orgId:     ObjectId, ref: 'Organization', required (tenant isolation)
 * - userId:    ObjectId, required (ID of the Staff or Subscriber who logged in)
 * - userType:  String, enum: ['Staff', 'Subscriber'], required
 * - ipAddress: String, required (extracted from req.ip / x-forwarded-for)
 * - userAgent: String (optional browser/device info)
 * - timestamp: Date, default: Date.now
 *
 * Schema Options:
 * - { timestamps: false } (timestamp field handles login time explicitly)
 */

import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userType',
    },
    userType: {
      type: String,
      enum: ['Staff', 'Subscriber'],
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, collection: 'login_history' }
);

// Fast lookup for recent security audits per organization
loginHistorySchema.index({ orgId: 1, timestamp: -1 });

export default mongoose.model('LoginHistory', loginHistorySchema);
