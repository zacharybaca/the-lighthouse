import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Organization from '../models/Organization.js';
import Staff from '../models/Staff.js';
import Plan from '../models/Plan.js';
// import NetworkStatus from '../models/NetworkStatus.js';

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };
};

// POST /api/orgs/onboard (Public)
export const onboardOrganization = async (req, res) => {
  try {
    const {
      orgName,
      portalName,
      supportEmail,
      stripeAccountId,
      themeColors,
      manager,
      plans,
    } = req.body;

    if (!orgName || !supportEmail || !manager?.email || !manager?.password || !manager?.firstName || !manager?.lastName) {
      return res.status(400).json({
        message: 'Organization details and initial Manager account fields are required.',
      });
    }

    if (!Array.isArray(plans) || plans.length === 0) {
      return res.status(400).json({
        message: 'At least one initial service plan is required to complete onboarding.',
      });
    }

    const normalizedManagerEmail = manager.email.toLowerCase().trim();
    const existingStaff = await Staff.findOne({ email: normalizedManagerEmail });
    if (existingStaff) {
      return res.status(409).json({ message: 'A staff account with that email already exists.' });
    }

    const organization = await Organization.create({
      orgName: orgName.trim(),
      portalName: portalName?.trim() || orgName.trim(),
      supportEmail: supportEmail.toLowerCase().trim(),
      stripeAccountId: stripeAccountId?.trim() || '',
      themeColors: {
        primary: themeColors?.primary || '#1a4f8b',
        secondary: themeColors?.secondary || '#2c7a7b',
      },
      onboardingCompleted: true,
    });

    const passwordHash = await bcrypt.hash(manager.password, 10);

    const managerAccount = await Staff.create({
      orgId: organization._id,
      email: normalizedManagerEmail,
      passwordHash,
      firstName: manager.firstName.trim(),
      lastName: manager.lastName.trim(),
      role: 'Manager',
    });

    const createdPlans = await Plan.insertMany(
      plans.map((p, index) => ({
        orgId: organization._id,
        planName: p.planName.trim(),
        price: Number(p.price),
        billingCycle: p.billingCycle || 'Monthly',
        speedTier: Number(p.speedTier) || index + 1,
        isActive: true,
      }))
    );

    const token = jwt.sign(
      {
        id: managerAccount._id,
        orgId: organization._id,
        role: 'Manager',
        userType: 'Staff',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      user: {
        id: managerAccount._id,
        orgId: organization._id,
        email: managerAccount.email,
        firstName: managerAccount.firstName,
        lastName: managerAccount.lastName,
        role: managerAccount.role,
        userType: 'Staff',
      },
      organization: {
        id: organization._id,
        orgName: organization.orgName,
        portalName: organization.portalName,
        supportEmail: organization.supportEmail,
        themeColors: organization.themeColors,
        onboardingCompleted: organization.onboardingCompleted,
      },
      plans: createdPlans,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ message: 'Server error during organization onboarding.' });
  }
};

// GET /api/orgs/current (All Auth)
export const getCurrentOrg = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    return res.status(200).json({
      organization: {
        id: org._id,
        orgName: org.orgName,
        portalName: org.portalName,
        supportEmail: org.supportEmail,
        stripeAccountId: org.stripeAccountId,
        themeColors: org.themeColors,
        onboardingCompleted: org.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Get current org error:', error);
    return res.status(500).json({ message: 'Server error retrieving organization.' });
  }
};

// PATCH /api/orgs/branding (Manager Only)
export const updateBranding = async (req, res) => {
  try {
    const { portalName, supportEmail, themeColors } = req.body;
    const org = await Organization.findById(req.user.orgId);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    if (portalName !== undefined) org.portalName = portalName.trim();
    if (supportEmail !== undefined) org.supportEmail = supportEmail.toLowerCase().trim();
    if (themeColors?.primary) org.themeColors.primary = themeColors.primary;
    if (themeColors?.secondary) org.themeColors.secondary = themeColors.secondary;

    await org.save();

    return res.status(200).json({
      organization: {
        id: org._id,
        orgName: org.orgName,
        portalName: org.portalName,
        supportEmail: org.supportEmail,
        themeColors: org.themeColors,
        onboardingCompleted: org.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Update branding error:', error);
    return res.status(500).json({ message: 'Server error updating branding.' });
  }
};

// GET /api/orgs/network-status (All Auth)
export const getNetworkStatus = async (req, res) => {
  try {
    // const statuses = await NetworkStatus.find({ orgId: req.user.orgId }).sort({ updatedAt: -1 });
    // return res.status(200).json({ statuses });
    return res.status(200).json({ message: 'Network status functionality is currently disabled.' });
  } catch (error) {
    console.error('Get network status error:', error);
    return res.status(500).json({ message: 'Server error retrieving network status.' });
  }
};

// PATCH /api/orgs/network-status (Manager Only)
export const updateNetworkStatus = async (req, res) => {
  try {
    const { region = 'All Regions', status, message = '' } = req.body;

    if (!['operational', 'degraded', 'outage'].includes(status)) {
      return res.status(400).json({ message: 'Status must be operational, degraded, or outage.' });
    }

    // const updated = await NetworkStatus.findOneAndUpdate(
    //   { orgId: req.user.orgId, region: region.trim() },
    //   { status, message: message.trim() },
    //   { new: true, upsert: true, runValidators: true }
    // );

    return res.status(200).json({ message: 'Network status functionality is currently disabled.' });
  } catch (error) {
    console.error('Update network status error:', error);
    return res.status(500).json({ message: 'Server error updating network status.' });
  }
};
