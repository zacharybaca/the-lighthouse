import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Staff from '../models/Staff.js';
import Subscriber from '../models/Subscriber.js';
import Organization from '../models/Organization.js';
import LoginHistory from '../models/LoginHistory.js';

const getBaseCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
};

const getCookieOptions = () => ({
  ...getBaseCookieOptions(),
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

const formatOrgPayload = (org) => {
  if (!org) return null;
  return {
    id: org._id,
    orgName: org.orgName,
    portalName: org.portalName,
    supportEmail: org.supportEmail,
    themeColors: org.themeColors,
    onboardingCompleted: org.onboardingCompleted,
  };
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check Staff first, then Subscriber
    let account = await Staff.findOne({ email: normalizedEmail });
    let userType = 'Staff';

    if (!account) {
      account = await Subscriber.findOne({ email: normalizedEmail }).populate('planId');
      userType = 'Subscriber';
    }

    // Use a generic error message to prevent email enumeration
    if (!account) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Block deactivated accounts if your Staff/Subscriber schema tracks active status
    if (account.isActive === false) {
      return res.status(403).json({ message: 'Account is deactivated. Contact your administrator.' });
    }

    const role = userType === 'Staff' ? account.role : 'Subscriber';

    const token = jwt.sign(
      {
        id: account._id,
        orgId: account.orgId,
        role,
        userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const org = await Organization.findById(account.orgId);

    // Record login audit entry without letting a logging failure block auth or leak a cookie on 500
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';

    try {
      await LoginHistory.create({
        orgId: account.orgId,
        userId: account._id,
        userType,
        ipAddress,
        userAgent: req.headers['user-agent'] || 'unknown',
      });
    } catch (auditError) {
      console.error('LoginHistory audit error:', auditError);
    }

    res.cookie('token', token, getCookieOptions());

    const userPayload = {
      id: account._id,
      orgId: account.orgId,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role,
      userType,
      ...(userType === 'Subscriber' && {
        plan: account.planId,
        accountBalance: account.accountBalance,
      }),
    };

    return res.status(200).json({
      user: userPayload,
      organization: formatOrgPayload(org),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const { id, orgId, userType } = req.user;

    const account =
      userType === 'Staff'
        ? await Staff.findOne({ _id: id, orgId }).select('-passwordHash')
        : await Subscriber.findOne({ _id: id, orgId })
            .select('-passwordHash')
            .populate('planId');

    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    if (account.isActive === false) {
      res.clearCookie('token', getBaseCookieOptions());
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    const org = await Organization.findById(orgId);
    const currentRole = userType === 'Staff' ? account.role : 'Subscriber';

    const userPayload = {
      id: account._id,
      orgId: account.orgId,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: currentRole,
      userType,
      ...(userType === 'Subscriber' && {
        plan: account.planId,
        accountBalance: account.accountBalance,
      }),
    };

    return res.status(200).json({
      user: userPayload,
      organization: formatOrgPayload(org),
    });
  } catch (error) {
    console.error('Session hydration error:', error);
    return res.status(500).json({ message: 'Server error retrieving session.' });
  }
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie('token', getBaseCookieOptions());
  return res.status(200).json({ message: 'Logged out successfully.' });
};
