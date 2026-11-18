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
