import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('hip_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hip_token');
      localStorage.removeItem('hip_user');
    }
    // Surface the backend's error message to callers that read `err.message`.
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    const normalised = new Error(serverMessage || error.message || 'Request failed');
    normalised.status = error.response?.status;
    normalised.response = error.response;
    return Promise.reject(normalised);
  }
);

export default axiosClient;
