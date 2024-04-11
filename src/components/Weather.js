import React, { useEffect, useState } from "react";

const Weather = ({sessionDate,sessionTime}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const API_KEY = '19c737dffbd944c5114401ce4fb6d57a';
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
  const sessionTimestamp = Math.round(sessionDateTime.getTime() / 1000);


console.log("user location",userLocation)
  console.log("väderdata",weatherData)

  useEffect(() => {
    const fetchWeatherData = async () => {
        console.log(userLocation)
      try {
 
        if (!userLocation) return;
        
        const { latitude, longitude } = userLocation;
     
        
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
     
        if (response.ok) {
            const data = await response.json();
        console.log(data)
          console.log("data",data)
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
      <p>{/* {getWeatherEmoji()} */} {userLocation.latitude}</p>

    </div>
  );
};

export default Weather;
