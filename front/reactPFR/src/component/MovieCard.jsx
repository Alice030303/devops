
import { Link } from 'react-router-dom';
import React, { useState } from "react";
import './css/MovieList.css'; 
import { useUser } from '../context/useUser';
const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;
const BACK_URL = import.meta.env.VITE_BACK_URL;


export function MovieCard({id, title, image, date, overview, runtime, listType}) {
    const { user, fetchUserProfile } = useUser();
    const isLoggedIn = !!(user && user._id);
    
    const [message, setMessage] = useState();
    const [messageType, setMessageType] = useState();

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 2000);
    };

    const addToList = async (type) => {
        let url = '';
        if (type === 'favorite') url = `${BACK_URL}/movies/favorite`;
        else if (type === 'wishlist') url = `${BACK_URL}/movies/wishlist`;
        else if (type === 'watched') url = `${BACK_URL}/movies/watched`;
        else return;
        try {
            
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                credentials: 'include',
                body: JSON.stringify({ movie: { tmdbId: id, title, posterPath: image, date, overview, runtime } }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'ajout');
            await fetchUserProfile();
            showMessage(data.message || "Ajout réussi", 'success');
        } catch (e) {
            showMessage(e.message || "Erreur lors de l'ajout", 'error');
            console.error(e);
        }
    };
    const removeFromList = async (type) => {

         let url = `${BACK_URL}/users/removeFromList`;
        try {
            
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                credentials: 'include',
                body: JSON.stringify({ idMovieToRemove: id,  listType: type }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erreur lors du retrait');
            await fetchUserProfile();
            showMessage(data.message || "Retrait réussi", 'success');
        } catch (e) {
            showMessage(e.message || "Erreur lors du retrait", 'error');
            console.error(e);
        }
    }

    return (
        <div className="movie-card-container">
            <Link to={`/movie/${id}`} className="movie-card" >
                {image &&
                    <img
                        src={`${TMDB_IMAGE_BASE_URL}/${image}`}
                        alt={title}
                    />
                }
                <div className="card-content">
                    <h3>{title}</h3>
                    <span className="date">{date?.split('T')[0]}</span>
                    <p className="overview">{overview || "Pas de synopsis disponible."}</p>
                </div>
            </Link>
            {isLoggedIn && (
                <div className="card-action-bar">
                    
                    <button
                        className="action-button favorite"
                        onClick={async () => {
                            if (listType === 'favorite') {
                                removeFromList('favorite');
                            } else {
                                addToList('favorite');
                            }
                        }}
                        title={listType === 'favorite' ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <span role="img" aria-label={listType === 'favorite' ? "Cœur barré" : "Cœur"}>{listType === 'favorite' ? '💔' : '❤️'}</span>
                    </button>
                    
                    <button
                        className="action-button watchlist"
                        onClick={async () => {
                            if (listType === 'wishlist') {
                              removeFromList('wishlist');
                            } else {
                                addToList('wishlist');
                            }
                        }}
                        title={listType === 'wishlist' ? "Retirer de la wishlist" : "Ajouter à la liste de souhaits"}
                    >
                        <span role="img" aria-label={listType === 'wishlist' ? "Liste barrée" : "Liste"}>{listType === 'wishlist' ? '🗑️' : '📋'}</span>
                    </button>
                    
                    <button
                        className="action-button seen"
                        onClick={async () => {
                            if (listType === 'watched') {
                               removeFromList('watched');
                            } else {
                                addToList('watched');
                            }
                        }}
                        title={listType === 'watched' ? "Retirer des vus" : "Marquer comme vu"}
                    >
                        <span role="img" aria-label={listType === 'watched' ? "Œil barré" : "Œil"}>{listType === 'watched' ? '🙈' : '👀'}</span>
                    </button>
                </div>
            )}
            {message && (
                <div className={`notif-message ${messageType}`}>{message}</div>
            )}
        </div>
    );
}