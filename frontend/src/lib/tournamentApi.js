import axios from "axios";
import { loadStoredAuth, loadSessionAuth } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get current auth token from storage
function getAuthToken() {
  const auth = loadStoredAuth() || loadSessionAuth();
  return auth?.token || null;
}

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth interceptor
API.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 403 Forbidden errors (permission denied)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    }
    return Promise.reject(error);
  }
);

export const getAllTournaments  = ()         => API.get('/tournaments');
export const getTournament      = (id)       => API.get(`/tournaments/${id}`);
export const createTournament   = (data)     => API.post('/tournaments', data);
export const updateTournament   = (id, data) => API.put(`/tournaments/${id}`, data);
export const deleteTournament   = (id)       => API.delete(`/tournaments/${id}`);
export const cloneTournament    = (id)       => API.post(`/tournaments/${id}/clone`);
export const generateFormat     = (data)     => API.post('/tournaments/generate-format', data);
export const addAnnouncement    = (id, data) => API.post(`/tournaments/${id}/announcements`, data);
