import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

// GET /api/notifications (Agent / Manager)
export const getNotifications = async (req, res) => {
  try {
    const { orgId } = req.user;

    const notifications = await Notification.find({ orgId })
      .populate('subscriberId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Server error retrieving notifications.' });
  }
};

// PATCH /api/notifications/:id/read (Agent / Manager)
export const markNotificationRead = async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, orgId },
      { isRead: true },
      { new: true }
    ).populate('subscriberId', 'firstName lastName email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.status(200).json({ notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'Server error updating notification.' });
  }
};
