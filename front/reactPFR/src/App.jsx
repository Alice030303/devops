import React, { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MovieList } from './component/MovieList'
import { MovieDetailPage } from './component/MovieDetail'
import { NavBar } from './component/NavBar'
import { AuthRedirector } from './component/AuthRedirector'
import { AuthPage } from './component/Auth'
import { Settings } from './component/Settings'
import { UserMovieList} from './component/UserMovieList'
import { Profile } from './component/Profile'
import { SearchPage} from './component/SearchPage'
import { UserContext } from './context/UserContext'
import { RecommendationPage } from "./component/RecommendationPage";
import './App.css'

function App() {
   const { checkTokenExpiration } = useContext(UserContext);

  useEffect(() => {
    checkTokenExpiration();
  }, [checkTokenExpiration]);

  return (
    <>
            <NavBar />
            <AuthRedirector />
            <Routes>
                
                <Route 
                    path="/" 
                    element={<SearchPage />} 
                />
                <Route 
                    path="/movies" 
                    element={<MovieList />} 
                />
                
                 <Route 
                    path="/user-movies" 
                    element={<UserMovieList  />} 
                />
                 <Route 
                    path="/recommendations" 
                    element={<RecommendationPage  />} 
                />


                <Route 
                    path="/profile" 
                    element={<Profile />} 
                />
                

                <Route 
                    path="/movie/:id" 
                    element={<MovieDetailPage />} 
                />
                <Route 
                    path="/auth" 
                    element={<AuthPage />} 
                />
                <Route 
                    path="/search" 
                    element={<SearchPage />} 
                />

                <Route 
                    path="/settings" 
                    element={<Settings />} 
                />
                
                {/* Optionnel: une route de secours 404 */}
                <Route 
                    path="*" 
                    element={<h1>404 - Page non trouvée</h1>} 
                />
            </Routes>
        </>
    );
}

export default App
