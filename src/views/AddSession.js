import React, { useContext, useRef, useEffect, useState } from 'react';
import "../styles/addSession.css";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuContext from '../context/MenuContext';

export default function AddSession() {
    const hamburgerRef = useRef(null);
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedPlace, setSelectedPlace] = useState("");
    const [users, setUsers] = useState([]);
    const [sessionArray, setSessionArray] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [exerciseCategories, setExerciseCategories] = useState([]);

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
        async function getExercises() {
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
                    console.log(data);
                    // Uppdatera sessionArray med hämtade övningar
                    setSessionArray(data);
                    // Extrahera och sätt kategorierna för övningarna
                    const categories = Array.from(new Set(data.map(exercise => exercise.category)));
                    setExerciseCategories(categories);
                } catch (err) {
                    console.log(err, "Kunde inte hämta övningarna");
                }
            }
        }
        getExercises();
    }, []);

    const toggleExpand = (category) => {
        setExpandedCategory(prevCategory => (prevCategory === category ? null : category));
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
                         {exerciseCategories.map(category => (
                             <div key={category}>
                                 <div className="expand" onClick={() => toggleExpand(category)}>
                                    <h2>{category}</h2>
                                     <img id="arrow" src="/arrow.png" style={{ transform: expandedCategory === category ? 'rotate(90deg)' : 'rotate(-90deg)' }} />
                                 </div>

                             <div className={expandedCategory === category ? "expanded-content expanded" : "expanded-content"}>
                                 {sessionArray.map(exercise => {
                                  if (exercise.category === category) {
                                return (
                                      <button key={exercise.name} className="exercise-button">{exercise.name}</button>
                                      );
                            }
                                  return null;
                            })}
                          </div>
        </div>
    ))}
</div>

                        

                    </div>
                </div>
            </div>
        </div>
    );
}