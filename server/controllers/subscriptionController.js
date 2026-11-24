import mongoose from 'mongoose';
import Subscriber from '../models/Subscriber.js';
import Plan from '../models/Plan.js';
import Notification from '../models/Notification.js';

// POST /api/subscriptions/upgrade (Subscriber Only)
export const upgradeSubscription = async (req, res) => {
  try {
    const { id, orgId } = req.user;
    const { newPlanId } = req.body;

    if (!newPlanId || !mongoose.Types.ObjectId.isValid(newPlanId)) {
      return res.status(400).json({ message: 'A valid newPlanId is required.' });
    }

    const subscriber = await Subscriber.findOne({ _id: id, orgId }).populate('planId');
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber account not found.' });
    }

    const newPlan = await Plan.findOne({ _id: newPlanId, orgId, isActive: true });
    if (!newPlan) {
      return res.status(404).json({ message: 'Target plan not found for this organization.' });
    }

    const currentTier = subscriber.planId?.speedTier ?? 0;
    if (newPlan.speedTier <= currentTier) {
      return res.status(400).json({
        message: 'Upgrade rejected: selected plan must have a higher speed tier than your current plan.',
      });
    }

    const previousPlanName = subscriber.planId?.planName || 'Previous Plan';
    subscriber.planId = newPlan._id;
    await subscriber.save();

    const notification = await Notification.create({
      orgId,
      subscriberId: subscriber._id,
      type: 'planUpgrade',
      message: `${subscriber.firstName} ${subscriber.lastName} upgraded from ${previousPlanName} to ${newPlan.planName}.`,
    });

    const populatedNotification = await Notification.findById(notification._id).populate(
      'subscriberId',
      'firstName lastName email'
    );

    // Emit live alert strictly to this organization's Socket.io room
    const io = req.app.get('io');
    if (io) {
      io.to(notification.orgId.toString()).emit('newNotification', populatedNotification);
    }

    return res.status(200).json({
      message: `Successfully upgraded to ${newPlan.planName}.`,
      plan: newPlan,
      notification: populatedNotification,
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return res.status(500).json({ message: 'Server error upgrading subscription.' });
  }
};
