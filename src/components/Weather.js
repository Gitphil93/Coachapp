import React, { useEffect, useState } from "react";
import LoaderSpinner from "../components/LoaderSpinner.js"
import "../styles/weather.css";
import Loader from "./Loader.js";

const Weather = ({ sessionDate, sessionTime }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState({latitude:57.708870, longitude: 11.974560}); 
  const [weatherData, setWeatherData] = useState(null);
  const API_KEY = '19c737dffbd944c5114401ce4fb6d57a';

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true)
        if (!userLocation) {
          console.log("Default location used");
        }
        
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
      } finally {
        setIsLoading(false)
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

  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}.png`;
  };

  if (!weatherData) {
    return <LoaderSpinner/>;
  }

  // Find the closest weather data object
  const closestWeatherData = weatherData.list.reduce((closest, current) => {
    const closestTimeDiff = Math.abs(new Date(closest.dt_txt) - new Date(`${sessionDate}T${sessionTime}`));
    const currentTimeDiff = Math.abs(new Date(current.dt_txt) - new Date(`${sessionDate}T${sessionTime}`));
    return currentTimeDiff < closestTimeDiff ? current : closest;
  });

  console.log(closestWeatherData)

  const iconUrl = getWeatherIconUrl(closestWeatherData.weather[0].icon);

  return (
    <div>
    {!isLoading &&
    <div className="weather-wrapper" key={closestWeatherData.dt}>
      <img src={iconUrl} alt="Weather icon" />
      <p id="weather-celsius">{Math.round(closestWeatherData.main.temp)} ºC</p>
    </div>
  }
  </div>
  );
};

export default Weather;
