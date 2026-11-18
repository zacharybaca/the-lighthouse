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
