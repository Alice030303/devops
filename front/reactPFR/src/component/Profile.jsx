import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieCard } from './MovieCard';
import { UserContext } from '../context/UserContext.js';
import './css/MovieList.css'; 
import './css/Profile.css';
import { UserListType } from './UserMovieList.jsx';
import { fetchMoviesByIds } from '../utils/movies.js';


export const Profile = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [wishlistMovies, setWishlistMovies] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  
  const fetchMovies = async (ids) => {
    if (!user) return [];
    return await fetchMoviesByIds(ids);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [wishlist, favorite, watched] = await Promise.all([
          fetchMovies(user.wishlist),
          fetchMovies(user.favorite),
          fetchMovies(user.watched),
        ]);
        
        setWishlistMovies(wishlist || []);
        setFavoriteMovies(favorite || []);
        setWatchedMovies(watched || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);


  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  
  const watchedCount = watchedMovies.length;
  const totalMinutes = watchedMovies.reduce((sum, m) => sum + (parseInt(m.runtime, 10) || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMinutesRemainder = totalMinutes % 60;
  const favoriteGenres = favoriteMovies.reduce((genreCount, movie) => {
 
    if (movie.genres) {
      movie.genres.forEach(genre => {
        genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
      });
    }
    return genreCount;
  }, {});
  

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>{user.name} {user.surname}</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/settings')} className="settings-btn">Paramètres</button>
         
        </div>
      </div>
    
      <hr /> 
      <div className='profile-container'>
       <div className="profile-stats-row">
        <div className="profile-stat-box">
          <div className="profile-stat-label">Nombre de films vus :</div>
          <div className="profile-stat-value">{watchedCount}</div>
        </div>
        <div className="profile-stat-box">
          <div className="profile-stat-label">Nombre d'heure{totalHours !== 1 ? 's' : ''}  devant des films :</div>
          <div className="profile-stat-value">{totalHours}h{totalMinutesRemainder > 0 ? ` ${totalMinutesRemainder}min` : ''}</div>
        </div>
        <div className="profile-stat-box">
          <div className="profile-stat-label">Genres favoris:</div>
          <div className="profile-stat-value">
            {Object.keys(favoriteGenres).length
              ? Object.entries(favoriteGenres).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
              : 'Aucun genre favori'}
          </div>
        </div>
      </div>
     <button onClick={() => navigate('/recommendations')} className="recommandation-button" >Voir mes recommandations IA</button>
      <div className="profile-section">
          
        <div className="profile-section-header">
          <h3 className="profile-section-title">Wishlist</h3>
          <button onClick={() => navigate('/user-movies', { state: { listType: UserListType.WISHLIST } })} className="see-all-btn-inline">Voir tout</button>
        </div>
        <div className="profile-movie-row">
          {wishlistMovies.slice(0, 6).map((movie) => (
            <MovieCard 
              key={movie.tmdbId}
              id={movie.tmdbId}
              title={movie.title}
              date={movie.date}
              image={movie.posterPath}
              overview={movie.overview}
              runtime={movie.runtime}
              listType={UserListType.WISHLIST}
            />
          ))}
          {[...Array(6 - wishlistMovies.slice(0, 6).length)].map((_, i) => (
            <div key={"wishlist-fake-" + i} className="fake-movie-card" />
          ))}
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section-header">
          <h3 className="profile-section-title">Favoris</h3>
          <button onClick={() => navigate('/user-movies', { state: { listType: UserListType.FAVORITE } })} className="see-all-btn-inline">Voir tout</button>
        </div>
        <div className="profile-movie-row">
          {favoriteMovies.slice(0, 6).map((movie) => (
            <MovieCard 
              key={movie.tmdbId}
              id={movie.tmdbId}
              title={movie.title}
              date={movie.date}
              image={movie.posterPath}
              overview={movie.overview}
              runtime={movie.runtime}
              listType={UserListType.FAVORITE}
            />
          ))}
          {[...Array(6 - favoriteMovies.slice(0, 6).length)].map((_, i) => (
            <div key={"favorite-fake-" + i} className="fake-movie-card" />
          ))}
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section-header">
          <h3 className="profile-section-title">Vus</h3>
          <button onClick={() => navigate('/user-movies', { state: { listType: UserListType.WATCHED } })} className="see-all-btn-inline">Voir tout</button>
        </div>
        <div className="profile-movie-row">
          {watchedMovies.slice(0, 6).map((movie) => (
            <MovieCard 
              key={movie.tmdbId}
              id={movie.tmdbId}
              title={movie.title}
              date={movie.date}
              image={movie.posterPath}
              overview={movie.overview}
              runtime={movie.runtime}
              listType={UserListType.WATCHED}
            />
          ))}
          {[...Array(6 - watchedMovies.slice(0, 6).length)].map((_, i) => (
            <div key={"watched-fake-" + i} className="fake-movie-card" />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};
