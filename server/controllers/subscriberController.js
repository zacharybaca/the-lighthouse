import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Subscriber from '../models/Subscriber.js';
import Organization from '../models/Organization.js';
import Plan from '../models/Plan.js';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/subscribers (Agent / Manager)
export const getSubscribers = async (req, res) => {
  try {
    const filter = { orgId: req.user.orgId };

    if (req.query.search?.trim()) {
      const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      filter.$or = [{ email: regex }, { firstName: regex }, { lastName: regex }];
    }

    const subscribers = await Subscriber.find(filter)
      .select('-passwordHash -supportPin.hash')
      .populate('planId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ subscribers });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return res.status(500).json({ message: 'Server error retrieving subscribers.' });
  }
};

// POST /api/subscribers (Agent / Manager)
export const createSubscriber = async (req, res) => {
  try {
    const { orgId } = req.user;
    const { email, password, firstName, lastName, planId, accountBalance } = req.body;

    const org = await Organization.findById(orgId);
    if (!org || !org.onboardingCompleted) {
      return res.status(403).json({
        message: 'Complete organization onboarding before adding subscribers.',
      });
    }

    if (!email || !password || !firstName || !lastName || !planId) {
      return res.status(400).json({
        message: 'email, password, firstName, lastName, and planId are required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: 'Invalid planId.' });
    }

    const plan = await Plan.findOne({ _id: planId, orgId, isActive: true });
    if (!plan) {
      return res.status(404).json({ message: 'Selected plan not found for this organization.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ orgId, email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        message: 'A subscriber with this email already exists in your organization.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const subscriber = await Subscriber.create({
      orgId,
      planId: plan._id,
      email: normalizedEmail,
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      accountBalance: Number(accountBalance) || 0,
    });

    const populated = await Subscriber.findById(subscriber._id)
      .select('-passwordHash -supportPin.hash')
      .populate('planId');

    return res.status(201).json({ subscriber: populated });
  } catch (error) {
    console.error('Create subscriber error:', error);
    return res.status(500).json({ message: 'Server error creating subscriber.' });
  }
};

// POST /api/subscribers/support-pin (Subscriber Only)
export const generateSupportPin = async (req, res) => {
  try {
    const { id, orgId } = req.user;
    const subscriber = await Subscriber.findOne({ _id: id, orgId });

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber account not found.' });
    }

    const plainPin = crypto.randomInt(100000, 1000000).toString();
    const hash = await bcrypt.hash(plainPin, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

    subscriber.supportPin = { hash, expiresAt };
    await subscriber.save();

    return res.status(200).json({
      pin: plainPin,
      expiresAt,
    });
  } catch (error) {
    console.error('Generate Support PIN error:', error);
    return res.status(500).json({ message: 'Server error generating Support PIN.' });
  }
};

// POST /api/subscribers/:id/verify-pin (Agent / Manager)
export const verifySupportPin = async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;
    const { pin } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid subscriber ID.' });
    }

    if (!pin || !/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({ message: 'A valid 6-digit PIN is required.' });
    }

    const subscriber = await Subscriber.findOne({ _id: id, orgId });
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }

    if (!subscriber.supportPin?.hash || !subscriber.supportPin?.expiresAt) {
      return res.status(400).json({ verified: false, message: 'No active Support PIN found.' });
    }

    if (new Date() > new Date(subscriber.supportPin.expiresAt)) {
      return res.status(400).json({ verified: false, message: 'Support PIN has expired.' });
    }

    const isMatch = await bcrypt.compare(String(pin), subscriber.supportPin.hash);
    if (!isMatch) {
      return res.status(401).json({ verified: false, message: 'Invalid Support PIN.' });
    }

    // Clear the PIN after a successful one-time verification
    subscriber.supportPin = { hash: undefined, expiresAt: undefined };
    await subscriber.save();

    return res.status(200).json({ verified: true, message: 'Support PIN verified.' });
  } catch (error) {
    console.error('Verify Support PIN error:', error);
    return res.status(500).json({ message: 'Server error verifying Support PIN.' });
  }
};
