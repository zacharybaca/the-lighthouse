/*
 * Model: Organization (The Tenant)
 *
 * Attributes:
 * - orgName:         String, required, trim
 * - portalName:      String (defaults to orgName if no custom name is provided)
 * - supportEmail:    String, required, lowercase, trim
 * - stripeAccountId: String (mock or live payment gateway ID)
 * - themeColors:     Object
 *     - primary:     String, default: '#1a4f8b'
 *     - secondary:   String
 * - onboardingCompleted: Boolean, default: false (unlocks Add Subscriber after 3-step wizard)
 *
 * Schema Options:
 * - { timestamps: true }
 */

import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    orgName: {
      type: String,
      required: true,
      trim: true,
    },
    portalName: {
      type: String,
      trim: true,
      default: function () {
        return this.orgName;
      },
    },
    supportEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    stripeAccountId: {
      type: String,
      trim: true,
    },
    themeColors: {
      primary: { type: String, default: '#1a4f8b' },
      secondary: { type: String, default: '#2c7a7b' },
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Organization', organizationSchema);
