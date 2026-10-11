import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables browser to automatically transmit HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle authentication expiration (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local user cache if session expired
      localStorage.removeItem('taskflow_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
