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
