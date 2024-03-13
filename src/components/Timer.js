import React, { useState, useEffect } from 'react';
import "./styles/Timer.css";

export default function Timer({ isOpen }) {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let intervalId;

        if (isRunning) {
            intervalId = setInterval(() => {
                setTime(prevTime => prevTime + 10); 
            }, 10); 
        }

        return () => clearInterval(intervalId); 
    }, [isRunning]);


    const minutes = Math.floor(time / (60 * 1000));
    const seconds = Math.floor((time % (60 * 1000)) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;

    const clearTimer = () => {
        setTime(0)
    }

    const toggleTimer = () => {
        setIsRunning(prevIsRunning => !prevIsRunning); 
    };

    return (
        <div className="home-wrapper" style={{ filter: isOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>
            <h2 className="view-header">Timer</h2>

            <div className="timer">
                <h1>{formattedTime}</h1>

                {time !== 0 && !isRunning &&
                <div className="clear-button-wrapper">
                <button className="clear-button" onClick={clearTimer}>Rensa</button>
            </div>
            }

        {time !== 0 && !isRunning &&
            <div className="clear-button-wrapper">
                <button className="save-time-button">Spara tid</button>
            </div>
        }

            </div>

          

            <div className="save-button-wrapper">
            <button className="save-button" onClick={toggleTimer} style={{ backgroundColor: isRunning ? 'red' : 'green' }}>


                    {isRunning ? 'Stoppa tid' : 'Starta tid'}
                </button>
            </div>
        </div>
    );
}
