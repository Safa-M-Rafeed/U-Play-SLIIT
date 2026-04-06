import { useState, useEffect } from 'react';
import { getAllTournaments } from '../lib/tournamentApi';
 
export const useTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
 
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data } = await getAllTournaments();
      setTournaments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchTournaments(); }, []);
 
  return { tournaments, loading, error, refetch: fetchTournaments };
};
