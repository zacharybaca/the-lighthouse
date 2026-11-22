import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import Login from './components/Auth/Login';
import OnboardingWizard from './components/OnboardingWizard/OnboardingWizard';
import DashboardLayout from './layouts/DashboardLayout';
import RoleRoute from './components/Routing/RoleRoute';
import SubscriberDashboard from './components/SubscriberDashboard/SubscriberDashboard';
import AgentDashboard from './components/AgentDashboard/AgentDashboard';
import ManagerDashboard from './components/ManagerDashboard/ManagerDashboard';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboard" element={<OnboardingWizard />} />

      {/* Protected Dashboard Views inside Persistent Layout */}
      <Route element={<DashboardLayout />}>
        {/* Subscriber Self-Service */}
        <Route element={<RoleRoute allowedRoles={['Subscriber']} />}>
          <Route path="/subscriber" element={<SubscriberDashboard />} />
        </Route>

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
