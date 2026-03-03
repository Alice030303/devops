import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MovieList } from './MovieList.jsx';
import { UserContext } from '../context/UserContext.js';
import { fetchMoviesByIds } from '../utils/movies.js';
import './css/UserMovieList.css';


const BACK_URL = import.meta.env.VITE_BACK_URL;
export const UserListType = Object.freeze({
  WISHLIST: 'wishlist',
  FAVORITE: 'favorite',
  WATCHED: 'watched',
});

export const UserMovieList = ({ propsListType = UserListType.WISHLIST }) => {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const location = useLocation();
 
  const listType =
    location.state?.listType ||
    propsListType ||
    UserListType.WISHLIST;
    
  const ids =   user?.[listType]|| [];

  useEffect(() => {
  
    const fetchMovies = async () => {
      if (!user  || !ids || !ids.length) {
        setMovies([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const moviesData = await fetchMoviesByIds(ids);
        setMovies(moviesData || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  
  }, [user, listType, ids]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="user-list">
      <MovieList movies={movies} />
    </div>
  );
};
