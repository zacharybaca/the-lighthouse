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
