import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const CheckToken = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lägg till detta för att få tillgång till nuvarande rutt

  useEffect(() => {
    // Rutter som inte kräver autentisering
    const publicRoutes = ['/', '/login', '/register', "/success", "/coach/register"];

    // Kontrollera om den nuvarande rutten är en av de offentliga rutterna
    if (publicRoutes.includes(location.pathname)) {
      return; // Avbryt useEffect om vi är på en offentlig sida
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log("Inget token hittades");
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenExpiration = decodedToken.exp;
      const tokenExpiryThreshold = 600; // 10 min
      //om det är mindre än 10 min kvar på tokenet så försöker vi refresha
      if (tokenExpiration - currentTime < tokenExpiryThreshold) {
    
        console.log("Försöker uppdatera token");
        updateToken(token);
      }
    } catch (error) {
      console.log("Token ej giltigt");
      navigate('/login');
    }
  }, [navigate, location]); // Lägg till location i dependency array

  const updateToken = async (token) => {
    try {
      const response = await fetch('https://appleet-backend.vercel.app/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        console.log("Token förnyat");
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error updating token:', error);
      navigate('/login');
    }
  };

  return null; // Komponenten renderar inget synligt
};

export default CheckToken;
