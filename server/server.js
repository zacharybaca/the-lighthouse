import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Uncomment each route as you build it out:
// import authRoutes from './routes/authRoutes.js';
// import orgRoutes from './routes/orgRoutes.js';
// import planRoutes from './routes/planRoutes.js';
// import staffRoutes from './routes/staffRoutes.js';
// import subscriberRoutes from './routes/subscriberRoutes.js';
// import subscriptionRoutes from './routes/subscriptionRoutes.js';
// import invoiceRoutes from './routes/invoiceRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Core Middleware
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true, // Required for HTTP-only JWT cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// 2. Socket.io Setup (shares port with Express)
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Phase 6: Replace with verified JWT cookie orgId check before joining
  socket.on('joinOrgRoom', (orgId) => {
    socket.join(orgId);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// 3. Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'The Lighthouse API is running' });
});

// 4. API Routes (uncomment as you implement each module)
// app.use('/api/auth', authRoutes);
// app.use('/api/orgs', orgRoutes);
// app.use('/api/plans', planRoutes);
// app.use('/api/staff', staffRoutes);
// app.use('/api/subscribers', subscriberRoutes);
// app.use('/api/subscriptions', subscriptionRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/notifications', notificationRoutes);

// 5. Connect to MongoDB, then start server
const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
