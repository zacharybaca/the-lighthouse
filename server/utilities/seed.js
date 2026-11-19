import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import Organization from '../models/Organization.js';
import Plan from '../models/Plan.js';
import Staff from '../models/Staff.js';
import Subscriber from '../models/Subscriber.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';
import LoginHistory from '../models/LoginHistory.js';

// Resolves server/.env reliably no matter which folder you run the script from
dotenv.config({ path: new URL('../.env', import.meta.url) });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // 1. Wipe existing data for a clean slate
    await Promise.all([
      Organization.deleteMany({}),
      Plan.deleteMany({}),
      Staff.deleteMany({}),
      Subscriber.deleteMany({}),
      Invoice.deleteMany({}),
      Notification.deleteMany({}),
      LoginHistory.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // 2. Create Organization (Tenant)
    const org = await Organization.create({
      orgName: 'Beacon Fiber',
      portalName: 'Beacon Fiber Portal',
      supportEmail: 'support@beaconfiber.example',
      stripeAccountId: 'acct_mock_beacon_001',
      themeColors: {
        primary: '#1a4f8b',
        secondary: '#2c7a7b',
      },
      onboardingCompleted: true,
    });

    // 3. Create Service Plans (3 tiers for upgrade testing)
    const [basicPlan, proPlan, gigPlan] = await Plan.insertMany([
      {
        orgId: org._id,
        planName: 'Starter Fiber 100',
        price: 49.99,
        billingCycle: 'Monthly',
        speedTier: 1,
        isActive: true,
      },
      {
        orgId: org._id,
        planName: 'Pro Fiber 500',
        price: 79.99,
        billingCycle: 'Monthly',
        speedTier: 2,
        isActive: true,
      },
      {
        orgId: org._id,
        planName: 'Gigabit Ultra 1000',
        price: 99.99,
        billingCycle: 'Monthly',
        speedTier: 3,
        isActive: true,
      },
    ]);

    // 4. Create Staff (1 Manager, 1 Agent)
    const [manager, agent] = await Staff.insertMany([
      {
        orgId: org._id,
        email: 'manager@beaconfiber.example',
        passwordHash,
        firstName: 'Jordan',
        lastName: 'Vance',
        role: 'Manager',
      },
      {
        orgId: org._id,
        email: 'agent@beaconfiber.example',
        passwordHash,
        firstName: 'Alex',
        lastName: 'Rivera',
        role: 'Agent',
      },
    ]);

    // 5. Create Subscribers
    const [subOne, subTwo] = await Subscriber.insertMany([
      {
        orgId: org._id,
        planId: basicPlan._id,
        email: 'maya.lin@example.com',
        passwordHash,
        firstName: 'Maya',
        lastName: 'Lin',
        accountBalance: 49.99,
      },
      {
        orgId: org._id,
        planId: proPlan._id,
        email: 'devon.brooks@example.com',
        passwordHash,
        firstName: 'Devon',
        lastName: 'Brooks',
        accountBalance: 0,
      },
    ]);

    // 6. Create Invoices (Paid, Pending, Failed, and 1 Prorated)
    await Invoice.insertMany([
      {
        orgId: org._id,
        subscriberId: subOne._id,
        amount: 24.99,
        status: 'Paid',
        issueDate: new Date('2026-10-16T09:00:00Z'),
        isProrated: true,
        prorationStart: new Date('2026-10-16T00:00:00Z'),
        prorationEnd: new Date('2026-10-31T23:59:59Z'),
      },
      {
        orgId: org._id,
        subscriberId: subOne._id,
        amount: 49.99,
        status: 'Pending',
        issueDate: new Date('2026-11-01T09:00:00Z'),
        isProrated: false,
      },
      {
        orgId: org._id,
        subscriberId: subTwo._id,
        amount: 79.99,
        status: 'Paid',
        issueDate: new Date('2026-11-01T09:00:00Z'),
        isProrated: false,
      },
      {
        orgId: org._id,
        subscriberId: subTwo._id,
        amount: 79.99,
        status: 'Failed',
        issueDate: new Date('2026-10-01T09:00:00Z'),
        isProrated: false,
      },
    ]);

    // 7. Create Notifications (Real-Time Agent Alerts)
    await Notification.insertMany([
      {
        orgId: org._id,
        subscriberId: subTwo._id,
        type: 'planUpgrade',
        message: 'Devon Brooks upgraded from Starter Fiber 100 to Pro Fiber 500.',
        isRead: false,
      },
      {
        orgId: org._id,
        subscriberId: subTwo._id,
        type: 'paymentFailed',
        message: 'Automatic payment of $79.99 failed for Devon Brooks.',
        isRead: true,
      },
    ]);

    // 8. Create LoginHistory (Security & Identity Audits)
    await LoginHistory.insertMany([
      {
        orgId: org._id,
        userId: manager._id,
        userType: 'Staff',
        ipAddress: '192.168.1.14',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
      },
      {
        orgId: org._id,
        userId: agent._id,
        userType: 'Staff',
        ipAddress: '192.168.1.22',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/130.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
      },
      {
        orgId: org._id,
        userId: subOne._id,
        userType: 'Subscriber',
        ipAddress: '73.45.102.88',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      },
    ]);

    console.log('Database seeded successfully!');
    console.log('Test Password for all accounts: Password123!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
