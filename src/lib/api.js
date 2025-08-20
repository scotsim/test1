// API utility functions for authentication
const API_BASE_URL = 'https://auth-service-v0rl.onrender.com';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data
    );
  }
  
  return data;
};

const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('accessToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/v2/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.access_token);
            
            // Retry original request with new token
            config.headers.Authorization = `Bearer ${refreshData.access_token}`;
            const retryResponse = await fetch(url, config);
            return await handleResponse(retryResponse);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw refreshError;
        }
      }
    }
    throw error;
  }
};

export const api = {
  // Auth endpoints
  signup: (email, password) => 
    makeRequest('/auth/v2/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) => 
    makeRequest('/auth/v2/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email, otp) => 
    makeRequest('/auth/v2/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resendVerification: (email) => 
    makeRequest('/auth/v2/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getUser: () => 
    makeRequest('/auth/v2/user'),

  logout: () => 
    makeRequest('/auth/v2/logout', { method: 'POST' }),

  refreshToken: (refreshToken) => 
    makeRequest('/auth/v2/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  requestPasswordReset: (email) => 
    makeRequest('/auth/v2/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, newPassword) => 
    makeRequest('/auth/v2/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    }),

  getVerificationStatus: () => 
    makeRequest('/auth/v2/verification-status'),

  // Test endpoints (development only)
  getTestUsers: () => 
    makeRequest('/test/users'),

  createTestUser: (userData) => 
    makeRequest('/test/create-test-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

export { ApiError };