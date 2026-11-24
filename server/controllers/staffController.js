import bcrypt from 'bcryptjs';
import Staff from '../models/Staff.js';
import LoginHistory from '../models/LoginHistory.js';

// GET /api/staff (Manager Only)
export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ orgId: req.user.orgId })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return res.status(200).json({ staff });
  } catch (error) {
    console.error('Get staff error:', error);
    return res.status(500).json({ message: 'Server error retrieving staff members.' });
  }
};

// POST /api/staff (Manager Only)
export const createStaff = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: 'email, password, firstName, and lastName are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Staff.findOne({
      orgId: req.user.orgId,
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(409).json({
        message: 'A staff account with this email already exists in your organization.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const member = await Staff.create({
      orgId: req.user.orgId,
      email: normalizedEmail,
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role === 'Manager' ? 'Manager' : 'Agent',
    });

    return res.status(201).json({
      staff: {
        id: member._id,
        orgId: member.orgId,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        createdAt: member.createdAt,
      },
    });
  } catch (error) {
    console.error('Create staff error:', error);
    return res.status(500).json({ message: 'Server error provisioning staff account.' });
  }
};

// GET /api/staff/audit-logs (Manager Only)
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await LoginHistory.find({ orgId: req.user.orgId })
      .populate('userId', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .limit(100);

    return res.status(200).json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ message: 'Server error retrieving audit logs.' });
  }
};
