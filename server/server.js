import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import planRoutes from './routes/planRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

// Required behind TLS proxies (e.g. Render) for Secure HTTP-only cookies
app.set('trust proxy', 1);

// 1. Core Middleware
// In production, Express serves client/dist from the same origin, so CORS is only needed in dev
if (!isProduction) {
  app.use(
    cors({
      origin: CLIENT_ORIGIN,
      credentials: true,
    })
  );
}
app.use(express.json());
app.use(cookieParser());

// 2. Socket.io Setup (shares port with Express)
const io = new Server(httpServer, {
  ...(!isProduction && {
    cors: {
      origin: CLIENT_ORIGIN,
      credentials: true,
    },
  }),
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

// 4. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch unmatched /api routes so they return JSON instead of React's index.html
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// 5. Serve Vite Production Build (must come after API routes)
if (isProduction) {
  const clientDistPath = path.resolve(__dirname, '../client/dist');

  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 6. Connect to MongoDB, then start server
const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
