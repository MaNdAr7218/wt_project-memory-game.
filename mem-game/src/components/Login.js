import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      // Verify token in response
      if (response && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token); // Save token
        setToken(response.data.token); // Update parent state
        navigate('/'); // Navigate to home page
      } else {
        alert('Invalid login response. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.error || 'Login failed. Please try again later.'
      );
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
