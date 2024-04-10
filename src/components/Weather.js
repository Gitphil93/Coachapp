import React, { useEffect, useState } from "react";

const Weather = ({ sessionDate }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const API_KEY = '19c737dffbd944c5114401ce4fb6d57a';

  console.log("väderdata",weatherData)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        if (!userLocation) return;
        
        const { latitude, longitude } = userLocation;
        
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        } else {
          console.error("Failed to fetch weather data");
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    if (userLocation && sessionDate) {
      fetchWeatherData();
    }
  }, [userLocation, sessionDate]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);

  const getWeatherEmoji = () => {
    if (!weatherData || !weatherData.weather || weatherData.weather.length === 0) {
      return "";
    }

    const weather = weatherData.weather[0].main.toLowerCase();
    switch (weather) {
      case "clear":
        return "☀️";
      case "clouds":
        return "☁️";
      case "rain":
        return "🌧️";
      case "snow":
        return "❄️";
      default:
        return "";
    }
  };

  if (!weatherData) {
    return <p>Loading weather...</p>;
  }

  return (
    <div>
      <p>Weather for {sessionDate}: {getWeatherEmoji()}</p>
      <p>Temperature: {weatherData.main.temp}°C</p>
      <p>Description: {weatherData.weather[0].description}</p>
    </div>
  );
};

export default Weather;
