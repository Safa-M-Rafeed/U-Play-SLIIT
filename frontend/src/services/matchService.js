import axios from 'axios';

// Base URL for your match-related endpoints
const API_URL = 'http://localhost:5000/api/matches';

/**
 * Helper to retrieve the Bearer token from local storage
 * and format the headers for authenticated requests.
 */
const getAuthHeaders = () => {
    try {
        const authData = localStorage.getItem('uplay_auth');

        if (!authData) {
            console.warn("MatchService: uplay_auth not found in storage.");
            return { headers: {} };
        }

        const parsed = JSON.parse(authData);
        const token = parsed.token || parsed.user?.token;

        if (!token) {
            console.warn("MatchService: Token missing inside uplay_auth.");
            return { headers: {} };
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error("MatchService: Error parsing uplay_auth", error);
        return { headers: {} };
    }
};

/**
 * NEW: UPLOAD Match Photos (Uses FormData)
 * This is required to fix the 400 error in MatchManagement.jsx:129
 */
export const uploadMatchPhoto = async (matchId, file) => {
    const formData = new FormData();
    // 'photos' should match the field name your backend 'multer' is looking for
    formData.append('photos', file); 

    const auth = getAuthHeaders();
    
    const response = await axios.post(
        `${API_URL}/${matchId}/photos`, 
        formData, 
        {
            headers: {
                ...auth.headers,
                'Content-Type': 'multipart/form-data' // Overrides application/json
            }
        }
    );
    return response.data;
};

/**
 * CREATE: Schedule a new match (Admin Only)
 */
export const createMatch = async (matchData) => {
    const response = await axios.post(`${API_URL}/create`, matchData, getAuthHeaders());
    return response.data;
};

/**
 * READ: Fetch all matches for the schedule
 */
export const getMatches = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

/**
 * READ: Fetch the calculated leaderboard
 */
export const getLeaderboard = async () => {
    const response = await axios.get(`${API_URL}/leaderboard`);
    return response.data;
};

/**
 * UPDATE: Update scores or status of a specific match (Admin Only)
 */
export const updateMatchScore = async (matchId, scoreData) => {
    const response = await axios.put(`${API_URL}/update/${matchId}`, scoreData, getAuthHeaders());
    return response.data;
};

/**
 * DELETE: Remove a match (Admin Only)
 */
export const deleteMatch = async (matchId) => {
    const response = await axios.delete(
        `${API_URL}/${matchId}`, 
        getAuthHeaders()
    );
    return response.data;
};