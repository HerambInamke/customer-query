import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://customer-query.onrender.com/api/v1',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    
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
