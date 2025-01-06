import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfilePage.css';

function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profileData) {
    return <div>Error loading profile data</div>;
  }

  return (
    <div className="profile-container">
      <h1>Welcome, {profileData.user.username}</h1>
      <h2>Your Scores</h2>

      {profileData.scores.length === 0 ? (
        <p>No scores available</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Difficulty</th>
              <th>Score</th>
              <th>Time Taken (s)</th>
              <th>Fails</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {profileData.scores.map((score, index) => (
              <tr key={index}>
                <td>{score.difficulty}</td>
                <td>{score.score}</td>
                <td>{score.time_taken}</td>
                <td>{score.fails}</td>
                <td>{new Date(score.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserProfile;
