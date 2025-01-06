import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import Register from './components/Register';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      setToken(null);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Default route should go to Register page */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* Register page */}
        <Route path="/register" element={<Register />} />

        {/* Login page */}
        <Route path="/login" element={<Login setToken={setToken} />} />

        {/* Home page */}
        <Route path="/home" element={token ? <HomePage /> : <Navigate to="/login" />} />

        {/* Game page */}
        <Route path="/game/:difficulty" element={token ? <GamePage /> : <Navigate to="/login" />} />

        {/* Profile page */}
        <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
