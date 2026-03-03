import React, { useState } from 'react';
import { MovieList } from './MovieList';
import UserList from './UserList';
import './css/SearchPage.css';

export const SearchPage = () => {
  const [searchType, setSearchType] = useState('movie');
  const [query, setQuery] = useState('');

  const handleTypeChange = (type) => {
    setSearchType(type);
  };

  return (
    <div className="search-page">
      <div className="search">
        <div className="search-header">
          <input
            className="search-input"
            type="text"
            placeholder={searchType === 'movie' ? 'Titre du film...' : "Nom d'utilisateur..."}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-tabs">
          <button
            className={`search-tab ${searchType === 'movie' ? 'active' : ''}`}
            onClick={() => handleTypeChange('movie')}
          >
            🎬 Films
          </button>

          <button
            className={`search-tab ${searchType === 'user' ? 'active' : ''}`}
            onClick={() => handleTypeChange('user')}
          >
            👤 Comptes
          </button>
        </div>
      </div>

      <div className="search-results">
        {searchType === 'movie' ? (
          <MovieList searchQuery={query} />
        ) : (
          <UserList searchQuery={query} />
        )}
      </div>

    </div>
  );
};

export default SearchPage;
