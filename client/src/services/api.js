import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://customer-query.onrender.com/api/v1',
  withCredentials: true, // Crucial for receiving/sending HttpOnly session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Standardize error payload returned to services
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    const data = error.response?.data?.data || null;
    const errors = error.response?.data?.errors || null;
    
    const formattedError = new Error(message);
    formattedError.status = error.response?.status;
    formattedError.data = data;
    formattedError.errors = errors;
    
    return Promise.reject(formattedError);
  }
);

export default api;
