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
 * - { timestamps: true }
 */
