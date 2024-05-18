import React, { useEffect, useState, useMemo } from "react";
import LoaderSpinner from "../components/LoaderSpinner.js"
import "../styles/weather.css";

const Weather = ({ sessionDate, sessionTime }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState({ latitude: 57.708870, longitude: 11.974560 });
  const [weatherData, setWeatherData] = useState(null);
  const API_KEY = '19c737dffbd944c5114401ce4fb6d57a';

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      const cachedData = sessionStorage.getItem('weatherData');
      // Kontrollerar om det finns cachad data och att den inte är för gammal
      if (cachedData && new Date() - new Date(JSON.parse(cachedData).timestamp) < 3600000) { // 1 timmes cache varaktighet
        setWeatherData(JSON.parse(cachedData).data);
        setIsLoading(false);
      } else {
        try {
          const { latitude, longitude } = userLocation;
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
          );
          if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('weatherData', JSON.stringify({ data: data, timestamp: new Date() }));
            setWeatherData(data);
          } else {
            console.error("Failed to fetch weather data");
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
        } finally {
          setIsLoading(false);
        }
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

  const closestWeatherData = useMemo(() => {
    if (!weatherData) return null;

    return weatherData.list.reduce((closest, current) => {
      const closestTimeDiff = Math.abs(new Date(closest.dt_txt) - new Date(`${sessionDate}T${sessionTime}`));
      const currentTimeDiff = Math.abs(new Date(current.dt_txt) - new Date(`${sessionDate}T${sessionTime}`));
      return currentTimeDiff < closestTimeDiff ? current : closest;
    }, weatherData.list[0]); 
  }, [weatherData, sessionDate, sessionTime]);

  if (!weatherData || !closestWeatherData) {
    return <LoaderSpinner/>;
  }

  const iconUrl = getWeatherIconUrl(closestWeatherData.weather[0].icon);

  return (
    <div>
      {!isLoading && (
        <div className="weather-wrapper" key={closestWeatherData.dt}>
          <img src={iconUrl} alt="Weather icon" />
          <p id="weather-celsius">{Math.round(closestWeatherData.main.temp)} ºC</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
