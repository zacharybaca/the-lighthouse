/*
 * Model: Staff (Tenant Employees / RBAC)
 *
 * Attributes:
 * - orgId:        ObjectId, ref: 'Organization', required (tenant isolation)
 * - email:        String, required, unique, lowercase, trim
 * - passwordHash: String, required (bcryptjs hash, never plain text)
 * - firstName:    String, required, trim
 * - lastName:     String, required, trim
 * - role:         String, enum: ['Agent', 'Manager'], default: 'Agent', required
 *
 * Schema Options:
 * - { timestamps: true, collection: 'staff' }
 */

import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
    role: {
      type: String,
      enum: ['Agent', 'Manager'],
      default: 'Agent',
      required: true,
    },
  },
  { timestamps: true, collection: 'staff' }
);

export default mongoose.model('Staff', staffSchema);
