import React, { useRef, useEffect, useState, useContext} from "react";
import { Link , useNavigate} from "react-router-dom"; 
import "../styles/Home.css";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuContext from "../context/MenuContext.js";
import Modal from "../components/Modal.js";
import Loader from "../components/Loader.js"
import {jwtDecode} from "jwt-decode"
import Weather from "../components/Weather.js"

export default function Home() {
  const [isGlobalMessageModalOpen, setIsGlobalMessageModalOpen] = useState(false);
  const [today, setToday] = useState("")
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const modalRef = useRef();
  const [name, setName] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const [userRole, setUserRole] = useState(0);
  const [initials, setInitials] = useState("");
  const [user, setUser] = useState(null)
  const [allTodaysSessions, setAllTodaysSessions] = useState([])
  const [userUpcomingSessions, setUserUpcomingSessions] = useState([]);
  const [userTodaysSession, setUserTodaysSession] = useState([])
  const [allUpcomingSessions, setAllUpcomingSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState(null)
  const [role, setRole] = useState(0)
  const navigate = useNavigate()

  console.log(today)


const getToday = () => {
  const dateObj = new Date();
  const year = dateObj.getFullYear().toString();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); 
  const day = dateObj.getDate().toString().padStart(2, '0'); 
  const date = `${year}-${month}-${day}`; 
  setToday(date)
  console.log(date);
}

  const openGlobalMessageModal = () => {
    if (isMenuOpen) {
      return
    }
    if (userRole > 1000) {
      setIsGlobalMessageModalOpen(true);
    }
  };

  const closeGlobalMessageModal = () => {
    if (userRole > 1000) {
      setIsGlobalMessageModalOpen(false);
    }
  };

  const openAdminModal = () => {
    if (userRole > 1000) {
      setIsAdminModalOpen(true);
    }
  };

  const closeAdminModal = () => {
    if (userRole > 1000) {
      setIsAdminModalOpen(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://192.168.0.36:5000/get-user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setName(data.user.name);
          setInitials(data.user.name[0] + data.user.lastname[0]);
          setUserRole(data.user.role);
          setUser(data.user);
        }
      })
      .then(() => {
     setIsLoading(false);  
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
     setIsLoading(false); 
      });
    }
  }, [today]);


  const getSessions = async () => {
              setIsLoading(true);
              const token = localStorage.getItem("token");
              const decodedToken = jwtDecode(token);
              setRole(decodedToken.role);
              setUser({ name: decodedToken.name, lastname: decodedToken.lastname });
              console.log(decodedToken.email);

          if (token && today) {
              try {
                  const response = await fetch("http://192.168.0.36:5000/get-sessions", {
                      method: "GET",
                      headers: {
                          Authorization: `Bearer ${token}`,
                      },
                  });
                  const data = await response.json();
                  const sessions = data.sessions;
                  const currentDate = new Date().toISOString().slice(0, 10);

                  // Sortera alla pass baserat på tid och datum
                  const sortedSessions = sessions.sort((a, b) => {
                      const dateA = new Date(`${a.date}T${a.time}`);
                      const dateB = new Date(`${b.date}T${b.time}`);
                      return dateA - dateB;
                  });

                  

                  
                 
                
                  const todaySessions = sortedSessions.filter(session => session.date === today);
                  setAllTodaysSessions(todaySessions);
                  if (role >= 2000) {
                      setAllUpcomingSessions(sortedSessions.filter(session => session.date > currentDate));
                  } else {
                      const userTodaysSession = allTodaysSessions.filter(session => session.attendees.map(attendee => attendee.email).includes(decodedToken.email))
                      setUserTodaysSession(userTodaysSession)
                      const userSessions = sortedSessions.filter(session => session.attendees.map(attendee => attendee.email).includes(decodedToken.email));
                      setAllUpcomingSessions(userSessions.filter(session => session.date > currentDate))
                  }
              } catch (err) {
                  console.error("Couldn't get sessions", err);
              } finally {
                  setIsLoading(false);
              }
          }
      };


      useEffect(() => {
          getSessions();
      }, [role, today]);

  const message = async () => {
    setIsGlobalMessageModalOpen(false);
    setIsAdminModalOpen(false);
    const message = prompt("Skriv globalt meddelande");

    if (message === null || message.trim() === "") {
      /* setGlobalMessage(""); */
      return false
    }

    setGlobalMessage(message);
    await postMessage(message);
  };

  const postMessage = async (message) => {
    setIsLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(
        "http://192.168.0.36:5000/admin/post-global-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            globalMessage: message.trim(),
            author: initials,
          }),
        },
      );

      if (response.ok) {
        fetchGlobalMessage();
      }

      console.log(response);
    } catch (err) {
      console.error("Något gick fel vid postning av meddelande", err);
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchGlobalMessage();
    getToday()
  }, []);


const getDayOfWeek = (dateString) => {
 
  const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  

  const date = new Date(dateString);
  
 
  return days[date.getDay()];
}


  const fetchGlobalMessage = async () => {
    try {
      const response = await fetch("http://192.168.0.36:5000/get-global-message",
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.globalMessage.globalMessage === "") {
          setGlobalMessage("");
        } else {
          setGlobalMessage(data.globalMessage);
        }
      } else {
        console.error("Failed to fetch global message");
      }
        setIsLoading(false)
    } catch (error) {
      console.error("Error fetching global message:", error);
    } finally{
    setIsLoading(false)  
    }
  };

  const deleteGlobalMessage = async () => {
    setGlobalMessage("");
    setIsGlobalMessageModalOpen(false);
  };

 
  
  const handleSessionClick = (sessionId) => {
    if (isMenuOpen) {
      return;
    }
    setSelectedSession(sessionId);
    navigate('/my-sessions', { state: { selectedSession: sessionId } });
  };

  let hour = new Date().getHours();
  let greeting = "";
  

  if (hour <= 10) {
    greeting = "God morgon";
  } else if (hour >= 18 && hour < 23) {
    greeting = "God kväll";
  } else {
    greeting = "Hej"
  }


   
  return (
    <div>
            {isLoading &&
       <Loader/>
}
      <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
      <Menu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        hamburgerRef={hamburgerRef}
      />

    {!isLoading &&
      <div
        className="home-wrapper"
        style={{
          filter: isMenuOpen
            ? "blur(4px) brightness(40%)"
            : "blur(0) brightness(100%)",
        }}
      >
        <div className="view-header">
          <h1>
            {" "}
            {greeting} {name}! 
          </h1>
        </div>
        {globalMessage && typeof globalMessage === "object" && (
          <div className="global-message">
            {globalMessage.globalMessage !== null &&
              globalMessage.globalMessage !== "" && (
                <>
                  <span className="global-message-author">
                    <h3 id="author">{globalMessage.author}</h3>
                  </span>

                  <span id="skrev">
                    <p>:</p>
                  </span>

                  <span
                    className="global-message-content"
                    onClick={openGlobalMessageModal}
                  >
                    <p>{globalMessage.globalMessage}</p>
                  </span>
                </>
              )}
          </div>
        )}



{userRole >= 2000 && (
          <div className="menu-icon">
            <img
              src="./plus-icon.svg"
              alt="plus-icon"
              onClick={openAdminModal}
              className="admin-button"
            />
          </div>
        )}

{!isLoading && allTodaysSessions.length > 0 ? (
  <div to="my-sessions" className="sessions-wrapper">
    <div className="sessions-header">
      <h2>Dagens Pass</h2>
    </div>
    {allTodaysSessions.map((session, sessionIndex) => {
      const attendeesInitials = session.attendees.map((attendee) => attendee.name[0] + attendee.lastname[0]);
      return (
        <div className="sessions" key={sessionIndex}>
          <div className="sessions-content" onClick={() => handleSessionClick(session)}>
            <div className="session-top">
              <h2>
                {getDayOfWeek(session.date)} {session.time}
              </h2>
              <h2><Weather sessionDate={session.date ? session.date : ""}
                sessionTime={session.time ? session.time : "12:00"} /></h2>
            </div>
            <div className="session-bottom">
              <h2>{session.place}</h2>
              <div className="session-initials">
                {attendeesInitials.map((initials, attendeeIndex) => (
                  <span key={attendeeIndex} className="initials-wrapper">
                    <h3 id="initials">{initials}</h3>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
) : (
  
  <div className="if-no-sessions">
      <div className="sessions-header">
      <h2>Dagens pass</h2>
      </div>

      <div className="no-sessions">
    <h2>Du har inga pass idag</h2>
    </div>
  </div>
)}






  <div className="sessions-wrapper">
    <div className="sessions-header">
      <h2>Kommande Pass</h2>
    </div>
    {allUpcomingSessions.map((session, index) => {
        const attendeesInitials = session.attendees.map((attendee) => attendee.name[0] + attendee.lastname[0]);

        return (
          <div className="sessions" key={index}>
            <div className="sessions-content" onClick={() => handleSessionClick(session)}>
              <div className="session-top">
              <h2>{getDayOfWeek(session.date)} {session.date} {session.time}</h2>
                <h2><Weather sessionDate={session.date ? session.date : ""}
                sessionTime={session.time ? session.time : "12:00"} /></h2>

              </div>
              <div className="session-bottom">
              <h2>{session.place}</h2>
              <div className="session-initials">
                {attendeesInitials.map((initials, index) => (
                  <span key={index} className="initials-wrapper">
                    <h3 id="initials">{initials}</h3>
                  </span>
                ))}
              </div>
              </div>
            </div>
          </div>
        );
      })}
  </div>
      



        <div id="modal-root">
          <Modal
            isOpen={isGlobalMessageModalOpen}
            onClose={closeGlobalMessageModal}
          >
            <div className="modal-wrapper">
              <div className="modal-header">
                <h2>Ändra eller ta bort globalt meddelande</h2>
              </div>

              <div className="modal-buttons">
                <button className="modal-button" onClick={message}>
                  Ändra
                </button>
                <button
                  className="modal-delete-button"
                  onClick={deleteGlobalMessage}
                >
                  Ta bort
                </button>
              </div>
            </div>
          </Modal>
        </div>

        <div id="modal-root">
          <Modal isOpen={isAdminModalOpen} onClose={closeAdminModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
                <h2>Admin</h2>
              </div>

              <div className="admin-modal">
                <Link
                  to="/add-session"
                  className="admin-modal-item"
                  onClick={closeAdminModal}
                >
                  <h2>Lägg till pass</h2>
                </Link>

                <Link
                  to="/add-excercise"
                  className="admin-modal-item"
                  onClick={closeAdminModal}
                >
                  <h2>Lägg till övning</h2>
                </Link>

                <Link
                  to="/add-athlete"
                  className="admin-modal-item"
                  onClick={closeAdminModal}
                >
                  <h2>Lägg till atlet</h2>
                </Link>

                <div className="admin-modal-item" onClick={message}>
                  <h2>Skriv globalt meddelande</h2>
                </div>
              </div>

              <div className="modal-buttons">
                <button className="modal-button" onClick={closeAdminModal}>
                  Stäng
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      } 
    </div>
  );
}
