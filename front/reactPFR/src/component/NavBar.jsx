import React, { useState,  useContext } from 'react';
import { Link } from 'react-router-dom';
import './css/NavBar.css'; 

import { UserContext } from '../context/UserContext.js';

export const NavBar = () => {
    const { user } = useContext(UserContext);
    
    const isLoggedIn = !!(user && user._id);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const profileLinkTo = isLoggedIn ? "/profile" : "/auth";

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/" onClick={closeMenu}>Movie App</Link>
            </div>

            
            <div className={`nav-burger ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                <li>
                    <Link to="/" onClick={closeMenu}>Chercher</Link>
                </li>
               
                
                {isLoggedIn && (
                    <li>
                        <Link to="/user-movies" onClick={closeMenu}>Ma liste</Link>
                    </li>
                )}
                
                <li>
                    <Link to={profileLinkTo} onClick={closeMenu}>
                        {isLoggedIn ? "Profil" : "Se connecter"}
                    </Link>
                </li>
            </ul>
        </nav>
    );
};