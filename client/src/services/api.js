
/**
 * Base API URL read from Vite environment variables (defaults to local Express port 5000)
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Centralized HTTP request wrapper around native fetch()
 *
 * @param {string} endpoint - The API endpoint path (e.g. '/auth/me', '/subscribers')
 * @param {RequestInit} [options={}] - Standard fetch configuration options
 * @returns {Promise<any>} Parsed JSON response body
 * @throws {Error} Throws normalized error message from server payload or HTTP status
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Normalize endpoint path to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  // Default headers for JSON REST communication
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Merge default options with caller overrides
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    /**
     * CRITICAL SECURITY CONFIGURATION:
     * Enforces automatic transmission of HTTP-only JWT session cookies
     * across origins (e.g. Vite client at :5173 -> Express server at :5000).
     * Zero token retrieval from localStorage.
     */
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);

    // 204 No Content handling (e.g., DELETE operations or empty acknowledgments)
    if (response.status === 204) {
      return null;
    }

    // Safely parse JSON if response body is present
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    // Intercept non-2xx HTTP error codes and normalize error message
    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status} (${response.statusText})`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw formatted errors for calling components (e.g., AuthContext, React forms)
    console.error(`[API Error] ${options.method || 'GET'} ${cleanEndpoint}:`, error.message);
    throw error;
  }
};

/**
 * Convenience helper methods for common HTTP verbs
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default apiRequest;
