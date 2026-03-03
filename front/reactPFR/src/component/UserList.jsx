

import { useEffect, useState, useContext } from 'react';
import { MovieList } from './MovieList';
import { UserContext } from '../context/UserContext.js';
import { MovieCard } from './MovieCard';
import { fetchMoviesByIds } from '../utils/movies.js';
import './css/UserList.css';


export default function UserList({ searchQuery }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [commonMovieIds, setCommonMovieIds] = useState([]);
  const [commonMovies, setCommonMovies] = useState([]);
  const [iaRecommendations, setIaRecommendations] = useState([]);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState(null);
    const fetchIaRecommendations = async () => {
      setIaLoading(true);
      setIaError(null);
      setIaRecommendations([]);
      try {
        const myFavs = user?.favorite || [];
        const theirFavs = selectedUser?.favorite || [];
        const allFavs = [...new Set([...myFavs, ...theirFavs])];

        if (!allFavs.length) throw new Error("Aucun favori à recommander.");

        const BACK_URL = import.meta.env.VITE_BACK_URL;
        const res = await fetch(`${BACK_URL}/movies/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ favorites: allFavs }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erreur serveur');
        }
        const data = await res.json();
        setIaRecommendations(data);
      } catch (e) {
        setIaError(e.message || 'Erreur lors de la recommandation IA.');
      } finally {
        setIaLoading(false);
      }
    };
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACK_URL}/users/search?search=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              "Content-Type": "application/json",
              
            },
            credentials: 'include', 
          }
        );
        const data = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error("Erreur chargement users :", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchUsers, 400); 
    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

  useEffect(() => {
    if (!selectedUser) {
      setCommonMovieIds([]);
      setCommonMovies([]);
      return;
    }
    const myWishlist = user?.wishlist || [];
    const theirWishlist = selectedUser?.wishlist || [];
    const myIds = myWishlist.map(m => (typeof m === 'object' ? m.id || m._id : m));
    const theirIds = theirWishlist.map(m => (typeof m === 'object' ? m.id || m._id : m));
    const commons = myIds.filter(id => theirIds.includes(id));
    setCommonMovieIds(commons);
  }, [selectedUser, user]);

  useEffect(() => {
    if (!commonMovieIds.length) {
      setCommonMovies([]);
      return;
    }
     
    const fetchMovies = async () => {
      try {
        const data = await fetchMoviesByIds(commonMovieIds);
        setCommonMovies(data || []);
      } catch (error) {
        console.error("Erreur chargement films communs :", error);
        setCommonMovies([]);
      }
    };
    fetchMovies();
  }, [commonMovieIds, user]);

  if (selectedUser) {
    return (
      <div className="user-detail-container">
        <button onClick={() => setSelectedUser(null)} style={{ marginBottom: 16 }}>&larr; Retour</button>
        <h3>{selectedUser.name}</h3>
        <div style={{marginTop:32}}>
          <button onClick={fetchIaRecommendations} disabled={iaLoading} className="recommandation-button">
            {iaLoading ? 'Chargement...' : 'Recommandation IA commune'}
          </button>
          {iaError && <div className="error">{iaError}</div>}
          {iaRecommendations.length=== 0 ? (
            <div>Aucune recommandation IA disponible.</div>
          ) : (
            <div >
              <h4>Suggestions IA à découvrir ensemble :</h4>
              <MovieList movies={iaRecommendations} />
            </div>
          )}
        </div>
        <h4 style={{ marginTop: 24 }}>Films à voir en commun : </h4>
        
          {commonMovies.length === 0 ? (
            <div>Aucun film en commun.</div>
          ) : (
            <MovieList movies={commonMovies} />
            )
          }
          {[...Array(Math.max(0, 5 - commonMovies.length))].map((_, i) => (
            <div key={"common-fake-" + i} className="fake-movie-card" />
          ))}
        
        
      </div>
    );
  }

  return (
    <div className="list-container">
      {users.map((u) => (
        <div key={u.id || u._id} className="user-row" onClick={() => setSelectedUser(u)}>
          <strong>{u.name}</strong>
         
        </div>
      ))}
      {loading && (
        <div style={{ width: '100%', textAlign: 'center', padding: 16 }}>
          Chargement...
        </div>
      )}
      {!users.length && !loading && (
        <div>Aucun utilisateur trouvé.</div>
      )}
    </div>
  );
}

