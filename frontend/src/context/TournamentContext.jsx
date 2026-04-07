import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAllTournaments } from '../lib/tournamentApi';

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch all tournaments with caching (cache for 1 minute)
  const fetchTournaments = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const cacheExpiry = 60000; // 1 minute

    // Return cached data if not forcing refresh and cache is fresh
    if (!forceRefresh && tournaments.length > 0 && lastFetch && now - lastFetch < cacheExpiry) {
      return { tournaments, loading: false, error: null };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getAllTournaments();
      const data = response.data || response; // Handle both axios response and direct data
      setTournaments(data);
      setLastFetch(now);
      return { tournaments: data, loading: false, error: null };
    } catch (err) {
      const errorMsg = err.message || 'Failed to load tournaments';
      setError(errorMsg);
      return { tournaments: [], loading: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [tournaments, lastFetch]);

  // Get single tournament (from cache if available)
  const getTournamentById = useCallback((id) => {
    return tournaments.find(t => t._id === id);
  }, [tournaments]);

  // Update tournament in cache
  const updateTournamentInCache = useCallback((id, updates) => {
    setTournaments(prev =>
      prev.map(t => t._id === id ? { ...t, ...updates } : t)
    );
  }, []);

  // Add tournament to cache
  const addTournamentToCache = useCallback((tournament) => {
    setTournaments(prev => [...prev, tournament]);
  }, []);

  // Remove tournament from cache
  const removeTournamentFromCache = useCallback((id) => {
    setTournaments(prev => prev.filter(t => t._id !== id));
  }, []);

  const value = {
    tournaments,
    loading,
    error,
    fetchTournaments,
    getTournamentById,
    updateTournamentInCache,
    addTournamentToCache,
    removeTournamentFromCache,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournamentContext = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournamentContext must be used within TournamentProvider');
  }
  return context;
};
