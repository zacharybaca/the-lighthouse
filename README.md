# The Lighthouse 🗼

A multi-tenant billing and account-monitoring dashboard built with the MERN stack. It features dynamic tenant branding, subscriber invoice management, and real-time Socket.io notifications for customer service agents. 

The application is designed to act as a self-service portal that shifts investigative power directly to the user, allowing them to monitor account health, spot unauthorized charges, and secure their data, while keeping billing agents in the loop via real-time alerts.

## 🌟 Features

*   **Multi-Tenant Architecture:** Organizations can register, set up their service catalogs, and manage isolated subscriber bases.
*   **Dynamic White-Labeling:** Subscriber-facing portals dynamically render custom portal names (e.g., "Surf Internet Billing Portal"), logos, and theme colors based on the organization's settings.
*   **Real-Time Agent Alerts:** Leveraging WebSockets (Socket.io), customer service agents receive instant notifications when subscribers request plan upgrades or report billing issues.
*   **Identity & Security Auditing:** Tracks user web tokens, login timestamps, and IP addresses to generate a "Security Score" and flag anomalous behavior.
*   **Invoice & Ledger Management:** Tracks subscription tiers, monthly statements, and mock payment history.

## 🛠️ Tech Stack

*   **Frontend:** React, Vanilla CSS (CSS Variables for dynamic theming), Socket.io-client
*   **Backend:** Node.js, Express.js, Socket.io
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JSON Web Tokens (JWT), bcryptjs

## 🚀 Getting Started

Follow these instructions to set up the project locally for development.

### Prerequisites

*   Node.js (v16 or higher)
*   MongoDB (Local installation or MongoDB Atlas URI)
*   Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zacharybaca/the-lighthouse.git
   cd the-lighthouse
   ```

2. **Setup the Backend**
   Install the Node dependencies in the root directory:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Setup the Frontend**
   Navigate into the client directory and install the React dependencies:
   ```bash
   cd client
   npm install
   ```

## 🏃‍♂️ Running the Application

You will need two terminal windows open to run the frontend and backend concurrently.

**Terminal 1 (Backend):**
```bash
# From the root directory
npm run dev
```

**Terminal 2 (Frontend):**
```bash
# From the /client directory
npm start
```

## Project Tree Directory
```bash
.
  |-client
  |  |-eslint.config.js
  |  |-index.html
  |  |-package-lock.json
  |  |-package.json
  |  |-public
  |  |  |-favicon.svg
  |  |  |-icons.svg
  |  |-src
  |  |  |-App.css
  |  |  |-App.jsx
  |  |  |-assets
  |  |  |  |-the-lighthouse-logo.png
  |  |  |-components
  |  |  |  |-AccountAtAGlance
  |  |  |  |  |-account-at-a-glance.css
  |  |  |  |  |-AccountAtAGlance.jsx
  |  |  |  |-AgentDashboard
  |  |  |  |  |-agent-dashboard.css
  |  |  |  |  |-AgentDashboard.jsx
  |  |  |  |-Auth
  |  |  |  |  |-Login.jsx
  |  |  |  |-HomePage
  |  |  |  |  |-home-page.css
  |  |  |  |  |-HomePage.jsx
  |  |  |  |-ManagerDashboard
  |  |  |  |  |-manager-dashboard.css
  |  |  |  |  |-ManagerDashboard.jsx
  |  |  |  |-OnboardingWizard
  |  |  |  |  |-onboarding-wizard.css
  |  |  |  |  |-OnboardingWizard.jsx
  |  |  |  |-Routing
  |  |  |  |  |-RoleRoute.jsx
  |  |  |  |-TransactionMonitor
  |  |  |  |  |-transaction-monitor.css
  |  |  |  |  |-TransactionMonitor.jsx
  |  |  |-context
  |  |  |  |-AuthContext.jsx
  |  |  |-hooks
  |  |  |  |-useSocket.js
  |  |  |-index.css
  |  |  |-layouts
  |  |  |  |-DashboardLayout.jsx
  |  |  |-main.jsx
  |  |  |-services
  |  |  |  |-api.js
  |  |  |-styles
  |  |  |  |-variables.css
  |  |-vite.config.js
  |-README.md
  |-server
  |  |-.env
  |  |-config
  |  |  |-db.js
  |  |-controllers
  |  |  |-authController.js
  |  |  |-invoiceController.js
  |  |  |-notificationController.js
  |  |  |-orgController.js
  |  |  |-planController.js
  |  |  |-staffController.js
  |  |  |-subscriberController.js
  |  |  |-subscriptionController.js
  |  |-middleware
  |  |  |-authMiddleware.js
  |  |-models
  |  |  |-Invoice.js
  |  |  |-LoginHistory.js
  |  |  |-Notification.js
  |  |  |-Organization.js
  |  |  |-Plan.js
  |  |  |-Staff.js
  |  |  |-Subscriber.js
  |  |-package-lock.json
  |  |-package.json
  |  |-routes
  |  |  |-authRoutes.js
  |  |  |-invoiceRoutes.js
  |  |  |-notificationRoutes.js
  |  |  |-orgRoutes.js
  |  |  |-planRoutes.js
  |  |  |-staffRoutes.js
  |  |  |-subscriberRoutes.js
  |  |  |-subscriptionRoutes.js
  |  |-server.js
```

The React app will launch at `http://localhost:3000` and the Express server will listen on `http://localhost:5000`.
