import React, { useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';
import { AuthContext } from './AuthContext';


// Default fallback theme colors matching The Lighthouse design tokens
const DEFAULT_THEME = {
  primary: '#1a4f8b',
  secondary: '#2c7a7b',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Dynamically applies the tenant's brand styling to the document root
   * and updates the browser tab title to the organization's portalName.
   */
  const applyTenantBranding = useCallback((org) => {
    const root = document.documentElement;

    if (org?.themeColors) {
      root.style.setProperty(
        '--primary-brand-color',
        org.themeColors.primary || DEFAULT_THEME.primary
      );
      root.style.setProperty(
        '--secondary-brand-color',
        org.themeColors.secondary || DEFAULT_THEME.secondary
      );
    } else {
      root.style.setProperty('--primary-brand-color', DEFAULT_THEME.primary);
      root.style.setProperty('--secondary-brand-color', DEFAULT_THEME.secondary);
    }

    if (org?.portalName) {
      document.title = org.portalName;
    } else {
      document.title = 'The Lighthouse';
    }
  }, []);

  /**
   * Session Hydration Handshake:
   * On mount, calls GET /api/auth/me to verify the HTTP-only cookie session.
   * If valid, hydrates user profile and tenant branding; otherwise clears state.
   */
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/auth/me');

      if (data?.user) {
        setUser(data.user);
        setOrganization(data.organization || null);
        applyTenantBranding(data.organization);
      } else {
        setUser(null);
        setOrganization(null);
        applyTenantBranding(null);
      }
    } catch (err) {
      // 401 Unauthorized or expired cookie returns a clean unauthenticated state
      setUser(null);
      setOrganization(null);
      applyTenantBranding(null);
    } finally {
      setLoading(false);
    }
  }, [applyTenantBranding]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Unified Login Handler:
   * Authenticates Staff (Manager/Agent) or Subscriber accounts.
   * Backend issues the HTTP-only cookie and returns user + org branding payload.
   */
  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data?.user) {
      setUser(data.user);
      setOrganization(data.organization || null);
      applyTenantBranding(data.organization);
    }

    return data;
  };

  /**
   * Logout Handler:
   * Requests backend to clear the HTTP-only cookie, clears local state,
   * and restores default theme variables.
   */
  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error during logout request:', err);
    } finally {
      setUser(null);
      setOrganization(null);
      applyTenantBranding(null);
    }
  };

  /**
   * Tenant Refresh Handler:
   * Called after Manager updates branding via PATCH /api/orgs/branding
   * to immediately reflect new colors and portalName across the UI.
   */
  const refreshOrg = (updatedOrg) => {
    if (updatedOrg) {
      setOrganization(updatedOrg);
      applyTenantBranding(updatedOrg);
    } else {
      apiRequest('/orgs/current')
        .then((org) => {
          setOrganization(org);
          applyTenantBranding(org);
        })
        .catch((err) => console.error('Failed to refresh tenant branding:', err));
    }
  };

  const value = {
    user,
    organization,
    loading,
    login,
    logout,
    refreshOrg,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
