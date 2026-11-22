import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth/AuthContext';

/**
 * RoleRoute Guard
 * @param {Array<string>} allowedRoles - e.g. ['Manager'] or ['Agent', 'Manager']
 */
const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // 1. Prevent redirection flashes while restoring session from GET /api/auth/me
  if (loading) {
    return (
      <div className="route-loader-container">
        <div className="spinner" />
        <p>Validating session...</p>
      </div>
    );
  }

  // 2. Redirect unauthenticated visitors to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If specific roles are required, verify access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Gracefully bounce users to their assigned primary dashboard
    const fallbackPath =
      user.role === 'Manager'
        ? '/manager'
        : user.role === 'Agent'
        ? '/agent'
        : '/subscriber';

    return <Navigate to={fallbackPath} replace />;
  }

  // 4. Authorized — render matching child route
  return <Outlet />;
};

export default RoleRoute;
