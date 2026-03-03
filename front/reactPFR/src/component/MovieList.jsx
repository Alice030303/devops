import { MovieCard } from './MovieCard';
import { useEffect, useState, useRef, useCallback } from 'react';
import './css/MovieList.css'; 


export function MovieList({ searchQuery, movies: moviesProp }) {
  const [movies, setMovies] = useState(moviesProp || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState(1);

  const observer = useRef();
  const sentinelRef = useRef();

  
  useEffect(() => {
    function updateColumns() {
      
      const minCardWidth = 220;
      const container = document.querySelector('.movie-list-container');
      const width = container ? container.offsetWidth : window.innerWidth;
      const cols = Math.max(1, Math.floor(width / (minCardWidth + 20))); 
      setColumns(cols);
    }
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  
  const fetchMovies = useCallback(async (pageToLoad) => {
    if (moviesProp) return; 
    setLoading(true);
    try {
      let url;
      if (searchQuery && searchQuery.length > 0) {
       
        url = `${import.meta.env.VITE_BACK_URL}/movies/search?search=${encodeURIComponent(searchQuery)}`;
      } else {
        url = `${import.meta.env.VITE_BACK_URL}/movies?page=${pageToLoad}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (searchQuery && searchQuery.length > 0) {
        setMovies(data.results || []);
        setHasMore(false);
      } else {
        if (pageToLoad === 1) {
          setMovies(data.results || []);
        } else {
          setMovies(prev => [...prev, ...(data.results || [])]);
        }
        if (!data.results || data.results.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.error("Erreur chargement films :", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, moviesProp]);

  
  useEffect(() => {
    if (moviesProp) {
      setMovies(moviesProp);
      setHasMore(false);
      setLoading(false);
      return;
    }
    setPage(1);
    setHasMore(true);
    fetchMovies(1);
  }, [searchQuery, fetchMovies, moviesProp]);

  
  useEffect(() => {
    if (moviesProp) return;
    if (searchQuery) return;
    if (loading) return;
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    });
    observer.current.observe(el);
    return () => observer.current && observer.current.disconnect();
  }, [loading, hasMore, searchQuery, moviesProp]);

  
  useEffect(() => {
    if (moviesProp) return;
    if (searchQuery) return;
    if (page === 1) return;
    fetchMovies(page);
  }, [page, searchQuery, fetchMovies, moviesProp]);


  if (!movies.length && !loading) {
    return (
      <div  className='list-container'>
        Aucun film à afficher.
      </div>
    );
  }

  // Ajout de MovieCard vides pour compléter la ligne
  const placeholders = [];
  if (columns > 1 && movies.length) {
    const missing = columns - (movies.length % columns || columns);
    for (let i = 0; i < missing; i++) {
      placeholders.push(
        <div className="movie-card-container placeholder" key={`ph-${i}`}> </div>
      );
    }
  }

  return (
    <div className="movie-list-container">
      {movies.map((movie) => (
        
        <MovieCard 
          key={movie.id || movie._id}
          id={movie.id || movie.tmdbId}
          title={movie.title}
          date={movie.release_date || movie.date}
          image={movie.poster_path || movie.posterPath}
          overview={movie.overview || movie.overview}
          runtime={movie.runtime}
        />
      ))}
      {placeholders}

      {!searchQuery && hasMore && (
        <div ref={sentinelRef} style={{ height: 1 }} />
      )}

      {loading && (
        <div style={{ width: '100%', textAlign: 'center', padding: 16 }}>
          Chargement...
        </div>
      )}
    </div>
  );
}
