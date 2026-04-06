import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

 
export const getAllTournaments  = ()         => API.get('/tournaments');
export const getTournament      = (id)       => API.get(`/tournaments/${id}`);
export const createTournament   = (data)     => API.post('/tournaments', data);
export const updateTournament   = (id, data) => API.put(`/tournaments/${id}`, data);
export const deleteTournament   = (id)       => API.delete(`/tournaments/${id}`);
export const cloneTournament    = (id)       => API.post(`/tournaments/${id}/clone`);
export const generateFormat     = (data)     => API.post('/tournaments/generate-format', data);
export const addAnnouncement    = (id, data) => API.post(`/tournaments/${id}/announcements`, data);
