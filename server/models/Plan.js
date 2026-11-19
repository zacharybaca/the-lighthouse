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

import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Annual'],
      default: 'Monthly',
    },
    speedTier: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Fast lookup for an org's plans sorted by tier
planSchema.index({ orgId: 1, speedTier: 1 });

export default mongoose.model('Plan', planSchema);
