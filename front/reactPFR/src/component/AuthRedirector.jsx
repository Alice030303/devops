import { useUser } from '../context/useUser';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthRedirector() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    
    if (loading) return;
    if ((!user || !user._id) && location.pathname !== '/auth' && location.pathname !== '/') {
      navigate('/auth');
    }
  }, [user, loading, navigate, location.pathname]);

  return null;
}
