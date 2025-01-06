import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <h1>Welcome to Mind Mosaics</h1>
      <div className="home-options">
        <button onClick={() => navigate('/game/easy')}>Play Easy</button>
        <button onClick={() => navigate('/game/medium')}>Play Medium</button>
        <button onClick={() => navigate('/game/hard')}>Play Hard</button>
        <button onClick={() => navigate('/profile')}>View Profile</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default HomePage;
