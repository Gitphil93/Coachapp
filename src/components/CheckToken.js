import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const CheckToken = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
     console.log("Inget token hittades")
      navigate('/login');
      return;
    }

    const decodedToken = jwtDecode(token);
    if (!decodedToken || !decodedToken.exp) {
        console.log("Token ej giltigt")
      navigate('/login');
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpiration = decodedToken.exp;
    const tokenExpiryThreshold = 60; // Threshold på 60 sekunder innan tokenet löper ut

    if (tokenExpiration - currentTime < tokenExpiryThreshold) {
        console.log("Försöker uppdatera token")
      updateToken(token);

    }
  }, [navigate]);

  const updateToken = async (token) => {
    try {
      const response = await fetch('http://192.168.0.30:5000/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        console.log("Token förnyat")
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error updating token:', error);
      // Om det uppstår ett fel, navigera till inloggningssidan
      navigate('/login');
    }
  };

  return null; // Komponenten renderar inget synligt
};

export default CheckToken;
