import React, { useState, useEffect, useContext, useRef } from "react";
import "../styles/Timer.css";
import MenuContext from "../context/MenuContext";
import Header from "../components/Header.js";
import Menu from "../components/Menu";
import AdminButton from "../components/AdminButton";

export default function Timer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const hamburgerRef = useRef(null);
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);

  useEffect(() => {

    let intervalId;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
  }, []);

  const minutes = Math.floor(time / (60 * 1000));
  const seconds = Math.floor((time % (60 * 1000)) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;

  const clearTimer = () => {
    setTime(0);
  };

  const toggleTimer = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  };

  return (
    <div>
      <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
      <Menu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        hamburgerRef={hamburgerRef}
      />
      <AdminButton/>

      <div className="home-wrapper">
         <div className="view-header">
        <h1>Timer</h1>
        </div>

        <div className="timer">
          <div className="counter">
          <h1>{formattedTime}</h1>
          </div>
          {time !== 0 && !isRunning && (
            <div className="clear-button-wrapper">
              <button className="clear-button" onClick={clearTimer}>
                Rensa
              </button>
            </div>
          )}

          {time !== 0 && !isRunning && (
            <div className="clear-button-wrapper">
              <button className="save-time-button">Spara tid</button>
            </div>
          )}
        </div>

        <div className="save-button-wrapper">
          <button
            className="save-button"
            onClick={toggleTimer}
            style={{ backgroundColor: isRunning ? "red" : "green" }}
          >
            {isRunning ? "Stoppa tid" : "Starta tid"}
          </button>
        </div>
      </div>
    </div>
  );
}
