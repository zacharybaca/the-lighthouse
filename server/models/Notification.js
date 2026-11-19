/*
 * Model: Notification (Real-Time Agent Alerts)
 *
 * Attributes:
 * - orgId:        ObjectId, ref: 'Organization', required (tenant isolation / Socket.io room)
 * - subscriberId: ObjectId, ref: 'Subscriber', required
 * - type:         String, enum: ['planUpgrade', 'paymentFailed', 'supportPin'], required
 * - message:      String, required
 * - isRead:       Boolean, default: false
 *
 * Schema Options:
 * - { timestamps: true }
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['planUpgrade', 'paymentFailed', 'supportPin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Fast lookup for unread alerts in the Agent Dashboard
notificationSchema.index({ orgId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
