import { useState, useEffect } from 'react';
import { UserContext, defaultUser } from './UserContext.js';
const BACK_URL= import.meta.env.VITE_BACK_URL
export function UserProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [loading, setLoading] = useState(true);

  const persistUser = (u) => {
    setUser(u);
  };

  const logout = () => {
    setUser(defaultUser);
    
    fetch(`${BACK_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  };

  
  const checkTokenExpiration = () => {
    fetch(`${BACK_URL}/users/profile`, {
      credentials: 'include',
    })
      .then(res => {
        if (res.status === 401) logout();
      })
      .catch(() => {});
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACK_URL}/users/profile`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur fetch user profile');
      const data = await res.json();
      persistUser(data.user || data);
     
    } catch (e) {
      console.error('Erreur fetchUserProfile', e);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser: persistUser, logout, checkTokenExpiration, fetchUserProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}
