import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { UserProvider } from "./context/UserStore.jsx";
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <UserProvider>
        <App />
      </UserProvider>
    </Router>
  </StrictMode>,
)
