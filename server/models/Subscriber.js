/*
 * Model: Subscriber (End-User Customer)
 *
 * Attributes:
 * - orgId:          ObjectId, ref: 'Organization', required (tenant isolation)
 * - planId:         ObjectId, ref: 'Plan', required (assigned service tier)
 * - email:          String, required, unique, lowercase, trim
 * - passwordHash:   String, required (bcryptjs hash, never plain text)
 * - firstName:      String, required, trim
 * - lastName:       String, required, trim
 * - accountBalance: Number, default: 0
 * - supportPin:     Object (optional embedded subdoc for 6-digit Support PIN)
 *     - hash:       String (hashed 6-digit PIN)
 *     - expiresAt:  Date (e.g., 10 minutes from generation)
 *
 * Schema Options:
 * - { timestamps: true }
 */

import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    supportPin: {
      hash: { type: String },
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

subscriberSchema.index({ orgId: 1, email: 1 }, { unique: true });

export default mongoose.model('Subscriber', subscriberSchema);
