import mongoose from 'mongoose';
import Plan from '../models/Plan.js';

// GET /api/plans (All Auth)
export const getPlans = async (req, res) => {
  try {
    const { orgId, role } = req.user;
    const filter = { orgId };

    // Managers can optionally view inactive plans via ?includeInactive=true
    if (role !== 'Manager' || req.query.includeInactive !== 'true') {
      filter.isActive = true;
    }

    const plans = await Plan.find(filter).sort({ speedTier: 1 });
    return res.status(200).json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    return res.status(500).json({ message: 'Server error retrieving service plans.' });
  }
};

// POST /api/plans (Manager Only)
export const createPlan = async (req, res) => {
  try {
    const { planName, price, billingCycle, speedTier } = req.body;

    if (!planName || price === undefined || speedTier === undefined) {
      return res.status(400).json({ message: 'planName, price, and speedTier are required.' });
    }

    const plan = await Plan.create({
      orgId: req.user.orgId,
      planName: planName.trim(),
      price: Number(price),
      billingCycle: billingCycle || 'Monthly',
      speedTier: Number(speedTier),
      isActive: true,
    });

    return res.status(201).json({ plan });
  } catch (error) {
    console.error('Create plan error:', error);
    return res.status(500).json({ message: 'Server error creating service plan.' });
  }
};

// PATCH /api/plans/:id (Manager Only)
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, price, billingCycle, speedTier, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid plan ID.' });
    }

    const plan = await Plan.findOne({ _id: id, orgId: req.user.orgId });
    if (!plan) {
      return res.status(404).json({ message: 'Service plan not found.' });
    }

    if (planName !== undefined) plan.planName = planName.trim();
    if (price !== undefined) plan.price = Number(price);
    if (billingCycle !== undefined) plan.billingCycle = billingCycle;
    if (speedTier !== undefined) plan.speedTier = Number(speedTier);
    if (isActive !== undefined) plan.isActive = Boolean(isActive);

    await plan.save();
    return res.status(200).json({ plan });
  } catch (error) {
    console.error('Update plan error:', error);
    return res.status(500).json({ message: 'Server error updating service plan.' });
  }
};
