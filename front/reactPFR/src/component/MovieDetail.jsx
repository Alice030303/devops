import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/useUser';
import './css/MovieDetail.css';

const BACK_URL = import.meta.env.VITE_BACK_URL;

const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;
const TMDB_CAST_IMAGE_URL = import.meta.env.VITE_TMDB_CAST_IMAGE_URL;


export function MovieDetailPage({ hideWishlistButton = false }) {
    const { fetchUserProfile, user } = useUser(); 
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isLoggedIn = !!user;
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' ou 'error'
    const fetchAndCacheMovieDetails = async (id) => {
        let movieData;

        try {
            
            const resGet = await fetch(`${BACK_URL}/movies/${id}/details`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!resGet.ok) {
                throw new Error(`Erreur lors de la récupération des détails : ${resGet.status}`);
            }

            movieData = await resGet.json();
            
        
            try {
                const resPost = await fetch(`${BACK_URL}/movies`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(movieData),
                });

                if (!resPost.ok) {
                    console.warn("Avertissement: Échec de l'enregistrement/mise en cache du film.", resPost.status);
                }
            } catch (postError) {
                console.error("Erreur lors de l'enregistrement du film:", postError);
            }

        
            return movieData; 

        } catch (error) {
            console.error("Échec du fetch initial ou de la sauvegarde:", error);
            throw error;
        }
    };
    
    useEffect(() => {
        const loadMovieDetails = async () => {
            setIsLoading(true);
            try {
                const data = await fetchAndCacheMovieDetails(id);
                setMovie(data);
            } catch (error) {
                console.error(error)
                setMovie(null);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) {
            loadMovieDetails();
        }
    }, [id]);

    
    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    const addToWishList = async (movie) => {

        try {
            const res = await fetch(`${BACK_URL}/movies/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                credentials: 'include',
                body: JSON.stringify({ movie }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'ajout à la wishlist');
            await fetchUserProfile();
            showMessage(data.message || "Ajout à la wishlist réussi", 'success');
        } catch (e) {
            showMessage(e.message || "Erreur lors de l'ajout à la wishlist", 'error');
            console.error(e);
        }
    };
    const addToFavorite = async (movie) => {
        
        try {
            const res = await fetch(`${BACK_URL}/movies/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                credentials: 'include',
                body: JSON.stringify({ movie }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'ajout aux favoris');
            await fetchUserProfile();
            showMessage(data.message || "Ajout aux favoris réussi", 'success');
        } catch (e) {
            showMessage(e.message || "Erreur lors de l'ajout aux favoris", 'error');
            console.error(e);
        }
    };
    const addToWatched = async (movie) => {
        
        try {
            const res = await fetch(`${BACK_URL}/movies/watched`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                credentials: 'include',
                body: JSON.stringify({ movie }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'ajout aux films regardés');
            await fetchUserProfile();
            showMessage(data.message || "Ajout aux films regardés réussi", 'success');
        } catch (e) {
            showMessage(e.message || "Erreur lors de l'ajout aux films regardés", 'error');
            console.error(e);
        }
    };
    if (isLoading) {
        return <div className="content-container">Chargement des détails...</div>;
    }
    if (!movie) {
        return <div className="content-container">Film non trouvé ou une erreur est survenue.</div>;
    }

    const backdropPath = movie.backdropPaths?.[0] || movie.images?.backdropPaths?.[0];
    const frProviders = movie.watchProviders;
    const streamingProviders = frProviders?.flatrate || frProviders?.rent || frProviders?.buy;

    return (
        <div className="movie-detail-page">
            <div
                className="header-backdrop"
                style={{
                    backgroundImage: backdropPath ? `url(${TMDB_IMAGE_BASE_URL}${backdropPath})` : 'none',
                }}
            >
                <div className="backdrop-overlay"></div>
                <div className="header-title-container">
                    <h1>
                        {movie.title}
                        <span className="release-date">
                            {movie.date.split('T')[0] || 'N/A'}
                        </span>
                    </h1>
                </div>
            </div>
            <div className="content-container">
                <div className="two-column-layout">
                    <div className="overview-section">
                        <h2 className="title-section">overview</h2>
                        <p>{movie.overview}</p>
                    </div>
                    <div className="vertical-divider"></div>
                    <div className="provider-section">
                        <h2 className="title-section">Où regarder (FR)</h2>
                        {streamingProviders?.length > 0 ? (
                            <ul className="provider-list">
                                {streamingProviders.map(provider => (
                                    <li key={provider.provider_id} className="provider-item">
                                        {provider.display_priority < 20 ? (
                                            <>
                                                <img
                                                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                                    alt={provider.provider_name}
                                                    className="provider-logo"
                                                />
                                                {provider.provider_name}
                                            </>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Aucune information de streaming disponible pour la France.</p>
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="title-section">Genre </h2>
                    <p>{movie.genres.map(g => g.name).join(' - ')}</p>
                </div>
                <h2 className="title-section">Bandes-annonces (Videos)</h2>
                <div className="videos-container">
                    {movie.videos?.length > 0 ? (
                        movie.videos
                            .filter(video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser'))
                            .slice(0, 2)
                            .map(video => (
                                <div key={video.key} className="video-item">
                                    <h3>{video.name}</h3>
                                    <iframe
                                    className='iframe'
                                       height="315"
                                        src={`https://www.youtube.com/embed/${video.key}`}
                                        title={`Bande-annonce : ${video.name}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ))
                    ) : (
                        <p>Aucune vidéo disponible.</p>
                    )}
                </div>
                <h2 className="title-section">Distribution (Cast)</h2>
                <div className="cast-container">
                    {movie.cast?.length > 0
                        ? movie.cast.slice(0, 10).map(actor => (
                            <div key={actor.id} className="actor-card">
                                <img
                                    src={actor.profile_path
                                        ? `${TMDB_CAST_IMAGE_URL}${actor.profile_path}`
                                        : 'https://via.placeholder.com/150x225?text=No+Image'}
                                    alt={actor.name}
                                    className="actor-image"
                                />
                                <p className="actor-name">{actor.name}</p>
                                <p className="actor-character">{actor.character}</p>
                            </div>
                        ))
                        : <p>Informations de distribution non disponibles.</p>
                    }
                </div>
                <h2 className="title-section">Équipe (Crew)</h2>
                <div className="crew-container">
                    {movie.crew?.length > 0
                        ? movie.crew.slice(0, 10).map(member => (
                            <div key={member.credit_id}>
                                <p style={{ margin: 0 }}>
                                    <span className="crew-member-name">{member.name}</span>
                                    {' '}
                                    <span className="crew-member-job">({member.job})</span>
                                </p>
                            </div>
                        ))
                        : <p>Informations de production non disponibles.</p>
                    }
                </div>
            </div>
            {isLoggedIn &&
                <>
                <div className="fixed-action-bar" >
                    <button
                        className="action-button favorite"
                        onClick={() => { addToFavorite(movie);  }}
                        title="Ajouter aux favoris"
                    >
                        <span role="img" aria-label="Cœur">❤️</span>
                    </button>
                    {!hideWishlistButton && (
                        <button
                            className="action-button watchlist"
                            onClick={() => { addToWishList(movie);  }}
                            title="Ajouter à la liste de souhaits"
                        >
                            <span role="img" aria-label="Liste">📋</span>
                        </button>
                    )}
                    <button
                        className="action-button seen"
                        onClick={() => { addToWatched(movie);  }}
                        title="Marquer comme vu"
                    >
                        <span role="img" aria-label="Œil">👀</span>
                    </button>
                </div>
                {message && (
                    <div className={`notif-message ${messageType}`}>{message}</div>
                )}
                </>
            }
        </div>
    );
}