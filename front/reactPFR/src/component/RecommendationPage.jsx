import { useEffect } from 'react';

import React, { useState } from 'react';
import { useUser } from '../context/useUser';
import { MovieList } from './MovieList';


export const RecommendationPage = () => {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [_, setLoading] = useState(false);
  const [error, setError] = useState(null);


 

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const favorites = user?.favorite || [];
      if (!favorites.length) throw new Error("Aucun favori trouvé.");

      const BACK_URL = import.meta.env.VITE_BACK_URL;
      const res = await fetch(`${BACK_URL}/movies/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ favorites }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }
      const data = await res.json();
      setRecommendations(data);
    } catch (e) {
      setError(e.message || 'Erreur lors de la récupération des recommandations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="user-detail-container">
     
      {error && <div className="error">{error}</div>}
      
        <MovieList movies={recommendations} />
      
    </div>
  );
}
