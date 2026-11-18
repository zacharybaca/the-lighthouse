/*
 * Model: Plan (Service Catalog)
 *
 * Attributes:
 * - orgId:        ObjectId, ref: 'Organization', required (tenant isolation)
 * - planName:     String, required, trim
 * - price:        Number, required, min: 0
 * - billingCycle: String, enum: ['Monthly', 'Annual'], default: 'Monthly'
 * - speedTier:    Number, required (higher number = faster plan; used to validate upgrades)
 * - isActive:     Boolean, default: true
 *
 * Schema Options:
 * - { timestamps: true }
 */
