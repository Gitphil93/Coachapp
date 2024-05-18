import React, { useState, useEffect } from 'react';

function Greeting() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour <= 10) return "God morgon";
    if (hour >= 18 && hour < 23) return "God kväll";
    return "Hej";
  }

  return greeting;
}

export default Greeting;
