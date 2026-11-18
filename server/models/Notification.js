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
