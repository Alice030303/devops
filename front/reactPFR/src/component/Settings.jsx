import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext.js';
import { useNavigate } from "react-router-dom"; 
import './css/Profile.css';


export const Settings = () => {
  const { user, logout , fetchUserProfile } = useContext(UserContext);
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    password: '',
    newPassword: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

 const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate('/auth');
    };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/users/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        
        },
        credentials: 'include', 
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour');
      setMessage('Mise à jour réussie');
      setMessageType('success');
      await fetchUserProfile();
    } catch (e) {
      setMessage(e.message);
      setMessageType('error');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h2>Paramètres du compte</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom :</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email :</label>
            <input id="email" name="email" value={form.email} onChange={handleChange} type="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe actuel :</label>
            <input id="password" name="password" value={form.password} onChange={handleChange} type="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe :</label>
            <input id="newPassword" name="newPassword" value={form.newPassword} onChange={handleChange} type="password" />
          </div>
          <button type="submit" className="submit-button">Enregistrer</button>
          <button onClick={handleLogout} className="submit-button" style={{marginTop: '1.5rem', background: '#c62828'}}>Se déconnecter</button>
        </form>
        {message && <div className={`notif-message ${messageType}`}>{message}</div>}
      </div>
    </div>
  );
};

export default Settings;
