import React, { useEffect, useState } from "react";
import LoaderSpinner from "../components/LoaderSpinner.js"
import "../styles/weather.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloud, faCloudShowersHeavy, faSnowflake } from '@fortawesome/free-solid-svg-icons';

const Weather = ({ sessionDate, sessionTime }) => {
  const [userLocation, setUserLocation] = useState({latitude:57.708870, longitude: 11.974560}); 

  const [weatherData, setWeatherData] = useState(null);
  const API_KEY = '19c737dffbd944c5114401ce4fb6d57a';


  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        
        if (!userLocation) {
            setUserLocation({latitude:57.708870, longitude: 11.974560}) 
            console.log("jag går in här")
        };
        
        const { latitude, longitude } = userLocation;
  
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
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

    if (userLocation) {
      fetchWeatherData();
    }
  }, [userLocation]);

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

  const getWeatherEmoji = (weather) => {
    switch (weather) {
      case "Clear":
        return <FontAwesomeIcon icon={faSun} />;
      case "Clouds":
        return <FontAwesomeIcon icon={faCloud} />;
      case "Rain":
        return <FontAwesomeIcon icon={faCloudShowersHeavy} />;
      case "Snow":
        return <FontAwesomeIcon icon={faSnowflake} />;
      default:
        return null;
    }
  };

  if (!weatherData) {
    return <LoaderSpinner/>;
  }

  // Hitta det närmaste väderdataobjektet i listan
  const closestWeatherData = weatherData.list.reduce((closest, current) => {
  
    const closestTimeDiff = Math.abs(new Date(closest.dt_txt) - new Date(`${sessionDate}T${sessionTime}`));
    const currentTimeDiff = Math.abs(new Date(current.dt_txt) - new Date(`${sessionDate}T${sessionTime}`));

    return currentTimeDiff < closestTimeDiff ? current : closest;
  });
  console.log(closestWeatherData)
  return (
    <div>
      <div className="weather-wrapper" key={closestWeatherData.dt}>
        <p>{getWeatherEmoji(closestWeatherData.weather[0].main)}</p>
        <p id="weather-celsius">{Math.round(closestWeatherData.main.temp)} ºC</p>
      </div>
    </div>
  );
};

export default Weather;
