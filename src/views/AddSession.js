import React, { useContext, useRef, useEffect, useState } from 'react';
import "../styles/addSession.css";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuContext from '../context/MenuContext';
import 'react-datepicker/dist/react-datepicker.css';

export default function AddSession() {
    const hamburgerRef = useRef(null);
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedPlace, setSelectedPlace] = useState("");
    const [users, setUsers] = useState([]);
    const [sessionArray, setSessionArray] = useState([]);
    const [expanded, setExpanded] = useState(false);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
    };

    const handlePlaceChange = (e) => {
        setSelectedPlace(e.target.value);
    };

    useEffect(() => {
        async function getUsers() {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("http://localhost:5000/get-all-users", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    console.log(data);
                    setUsers(data.users);
                } catch (err) {
                    console.log(err, "Kunde inte hämta användarna");
                }
            }
        }
        getUsers();
    }, []);

    useEffect(() => {
        async function getExcercises() {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("http://localhost:5000/get-exercises", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    console.log(data); // Logga ut de hämtade övningarna
                } catch (err) {
                    console.log(err, "Kunde inte hämta övningarna");
                }
            }
        }
        getExcercises();
    }, []);

    const toggleExpand = () => {
        setExpanded(!expanded);

   
    };

    return (
        <div>
            <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef} />
            <div className="home-wrapper" style={{ filter: isMenuOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>
                <h1 className="view-header">Lägg till pass</h1>

                <div className="input-wrapper">
                    <h2>Lägg till deltagare</h2>
                    <div className="attendees">
                        {users.map(user => (
                            <button key={user.name} className="attendees-button">{user.name}</button>
                        ))}
                    </div>

                    <div className="date-time-header">
                        <h2>Datum</h2>
                        <h2>Tid</h2>
                    </div>

                    <div className="datetime-wrapper">
                        <div className="datetime-picker">
                            <input type="text"
                                placeholder="YYMMDD"
                                value={selectedDate}
                                onChange={handleDateChange}
                            />
                            <input
                                type="text"
                                placeholder="HH:MM"
                                value={selectedTime}
                                onChange={handleTimeChange}
                            />
                        </div>
                    </div>

                    <div className="input-name">
                        <h2>Plats</h2>
                        <input
                            type="text"
                            value={selectedPlace}
                            onChange={handlePlaceChange}
                        />
                    </div>

                    <div className="add-exercises">
                        <div className="add-exercises-header">
                            <h2>Lägg till övningar</h2>
                        </div>

                        <div className="expand-wrapper">
                        <div className="expand" onClick={toggleExpand}>
                            <h2>Uppvärmning</h2>
                            <img id="arrow" src="/arrow.png" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(-90deg)' }} />
                        </div>
                        <div className={expanded ? "expanded-content expanded" : "expanded-content"}>
                          <button className="exercise-button">Övningar</button>
                          <button className="exercise-button">Jogga 1 km</button>
                          <button className="exercise-button">Stretch</button>
                          <button className="exercise-button">Spring 4 gånger 400m</button>
                          <button className="exercise-button">Övningar</button>
                          <button className="exercise-button">Övningar</button>
       

                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
