import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import { UserContext } from '../context/UserContext.js';
import './css/Auth.css'; 
const BACK_URL = import.meta.env.VITE_BACK_URL;
export const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  


  // Fonction de robustesse du mot de passe
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
      if (strength < 4) {
        setPasswordError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const url = isRegister
      ? `${BACK_URL}/auth/register`
      : `${BACK_URL}/auth/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include" 
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Une erreur est survenue");
        return;
      }

      if (!isRegister) {
        
        try {
          const resProfile = await fetch(`${BACK_URL}/users/profile`, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json"
              
            },
            credentials: 'include', 
          });
          const profile = await resProfile.json();
          const userData = { ...profile.user || profile };
          setUser(userData);
        } catch (e) {
          setUser({});
          console.error("Erreur lors de la récupération du profil :", e);
        }
        setMessage("Connecté avec succès !");
        navigate('/');
      } else {
        setMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      
        setIsRegister(false);
        setForm({ name: "", email: "", password: "" });
      }
    } catch (error) {
      
      setMessage(`Erreur réseau: ${error.message}`); 
    }
  };

  return (
    
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h2>{isRegister ? "S'inscrire" : "Se connecter"}</h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Nom:</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe:</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {isRegister && (
              <div className="password-strength">
                <progress max="5" value={passwordStrength}></progress>
                <span style={{ color: passwordStrength < 4 ? 'red' : 'green', fontSize: '0.9em' }}>
                  {passwordError ? passwordError : passwordStrength === 5 ? 'Mot de passe robuste' : 'Mot de passe correct'}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isRegister && passwordStrength < 4}>
            {isRegister ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        {message && <p className={`message ${message.includes('réussi') ? 'success' : 'error'}`}>{message}</p>}

        <p className="toggle-auth-mode" onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
            setForm({ name: "", email: "", password: "" }); 
        }}>
          {isRegister ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? Inscrivez-vous"}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;