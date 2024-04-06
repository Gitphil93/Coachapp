import React, {useState, useEffect, useContext, useRef} from 'react';
import "../styles/mySessions.css";
import MenuContext from "../context/MenuContext.js";
import Header from '../components/Header';
import Menu from '../components/Menu';
import {jwtDecode} from "jwt-decode"; // Ändrad import

export default function MySessions() {
    const modalRef = useRef();
    const hamburgerRef = useRef(null);
    const [allSessions, setAllSessions] = useState([]);
    const [userUpcomingSessions, setUserUpcomingSessions] = useState([]);
    const [userPastSessions, setUserPastSessions] = useState([]);
    const [allUpcomingSessions, setAllUpcomingSessions] = useState([]);
    const [allPastSessions, setAllPastSessions] = useState([]);
    const [role, setRole] = useState(0);
    const [user, setUser] = useState({});
    const [email, setEmail]= useState("");
    const [expandedContent, setExpandedContent] = useState(null);
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);

    useEffect(() => {
        const getSessions = async () => {
            const token = localStorage.getItem("token");
            const decodedToken = jwtDecode(token);
            setRole(decodedToken.role);

            if (token) {
                try {
                    const response = await fetch(
                        "http://192.168.0.36:5000/get-sessions",
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );
                    const data = await response.json();
                    const sessions = data.sessions;
                    const currentDate = new Date().toISOString().slice(0, 10);

                    setAllSessions(data.sessions);

                    if (role >= 2000) {
                        setAllUpcomingSessions(sessions.filter(session => session.date >= currentDate));
                        setAllPastSessions(sessions.filter(session => session.date < currentDate));
                    } else {
                        const userSessions = sessions.filter(session => session.attendees.includes(decodedToken.email));
                        setUserUpcomingSessions(userSessions.filter(session => session.date >= currentDate));
                        setUserPastSessions(userSessions.filter(session => session.date < currentDate));
                        setAllUpcomingSessions(sessions.filter(session => session.date >= currentDate));
                        setAllPastSessions(sessions.filter(session => session.date < currentDate));
                    }
                } catch (err) {
                    console.error("Couldn't get sessions", err);
                }
            }
        };
        getSessions();
    }, [role]);

    const toggleExpandContent = (session) => {
        setExpandedContent(prevContent => prevContent === session ? null : session);
    };

    const isContentExpanded = (session) => {
        return expandedContent === session;
    };

    const getDayOfWeek = (dateString) => {
        const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
        const date = new Date(dateString);
        return days[date.getDay()];
    };

    return (
        <div>
            <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef} />

            <div className="home-wrapper" style={{ filter: isMenuOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>
                <h1 className="view-header">Mina pass</h1>

                <div className="sessions-wrapper">
                    <div className="sessions-header">
                        <h2>Kommande pass</h2>
                    </div>
                    {role >= 2000 ? (
                        allUpcomingSessions.map((session, index) => (
                            <div className={"sessions-expandable" + (isContentExpanded(session) ? " expanded" : "")} key={index}  onClick={() => toggleExpandContent(session)}> 
                                <div className="sessions-content">
                                    <div className="session-top">
                                        <h2> {getDayOfWeek(session.date)} {session.date} {session.time}</h2>
                                    </div>

                                    
                                    {isContentExpanded(session) && (
                    <div className="expanded-session-content">
                        {/* Loopa ut alla övningar för sessionen */}
                        {session.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex}>
                                <h3 id="exercise-name">{exercise.name}</h3>
                                <p id="exercise-comment">{exercise.comment}</p>
                            {/*     <p id="exercise-desc">{exercise.description}</p> */}
                            </div>
                        ))}
                    </div>
                )}

                                    <div className="session-bottom">
                                        <h2>{session.place}</h2>
                                        <div className="session-initials">
                                            {session.attendees.map((initials, attendeeIndex) => (
                                                <span key={attendeeIndex} className="initials-wrapper">
                                                    <h3 id="initials">{initials.name[0] + initials.lastname[0]}</h3>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        userUpcomingSessions.map((session, index) => (
                            <div className={"sessions-expandable" + (isContentExpanded(session) ? " expanded" : "")} key={index}  onClick={() => toggleExpandContent(session)}> 
                                <div className="sessions-content">
                                    <div className="session-top">
                                        <h2> {getDayOfWeek(session.date)} {session.date} {session.time}</h2>
                                    </div>

                                    {isContentExpanded(session) && (
                    <div className="expanded-session-content">
                        {session.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex}>
                                <h3>{exercise.name}</h3>
                                <p>{exercise.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                                    <div className="session-bottom">
                                        <h2>{session.place}</h2>
                                        <div className="session-initials">
                                            {session.attendees.map((initials, attendeeIndex) => (
                                                <span key={attendeeIndex} className="initials-wrapper">
                                                    <h3 id="initials">{initials.name[0] + initials.lastname[0]}</h3>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="sessions-wrapper">
                    <div className="sessions-header">
                        <h2>Tidigare pass</h2>
                    </div>
                    {role >= 2000 ? (
                        allPastSessions.map((session, index) => (
                            <div className={"sessions-expandable" + (isContentExpanded(session) ? " expanded" : "")} key={index}  onClick={() => toggleExpandContent(session)}> 
                                <div className="sessions-content">
                                    <div className="session-top">
                                        <h2> {getDayOfWeek(session.date)} {session.date} {session.time}</h2>
                                    </div>

                                    {isContentExpanded(session) && (
                    <div className="expanded-session-content">
                        {/* Loopa ut alla övningar för sessionen */}
                        {session.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex}>
                                <h3>{exercise.name}</h3>
                                <p>{exercise.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                                    <div className="session-bottom">
                                        <h2>{session.place}</h2>
                                        <div className="session-initials">
                                            {session.attendees.map((initials, attendeeIndex) => (
                                                <span key={attendeeIndex} className="initials-wrapper">
                                                    <h3 id="initials">{initials.name[0] + initials.lastname[0]}</h3>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        userPastSessions.map((session, index) => (
                            <div className={"sessions-expandable" + (isContentExpanded(session) ? " expanded" : "")} key={index}  onClick={() => toggleExpandContent(session)}> 
                                <div className="sessions-content">
                                    <div className="session-top">
                                        <h2> {getDayOfWeek(session.date)} {session.date} {session.time}</h2>
                                    </div>

                                    {isContentExpanded(session) && (
                    <div className="expanded-session-content">
                        {/* Loopa ut alla övningar för sessionen */}
                        {session.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex}>
                                <h3>{exercise.name}</h3>
                                <p>{exercise.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                                    <div className="session-bottom">
                                        <h2>{session.place}</h2>
                                        <div className="session-initials">
                                            {session.attendees.map((initials, attendeeIndex) => (
                                                <span key={attendeeIndex} className="initials-wrapper">
                                                    <h3 id="initials">{initials.name[0] + initials.lastname[0]}</h3>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
