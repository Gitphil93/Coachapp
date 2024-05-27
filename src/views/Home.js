import React, { useRef, useEffect, useState, useContext} from "react";
import { Link , useNavigate } from "react-router-dom"; 
import "../styles/Home.css";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuContext from "../context/MenuContext.js";
import Modal from "../components/Modal.js";
import Loader from "../components/Loader.js"
import {jwtDecode} from "jwt-decode"
import Weather from "../components/Weather.js"
import Footer from "../components/Footer.js"
import AdminButton from "../components/AdminButton";
import Greeting from "../components/Greeting";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

export default function Home() {
  const [isGlobalMessageModalOpen, setIsGlobalMessageModalOpen] = useState(false);
  const [today, setToday] = useState("")
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const hamburgerRef = useRef(null);
 /*  const modalRef = useRef(); */
  const [name, setName] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalMessageLike, setGlobalMessageLike] = useState(0)
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const [userRole, setUserRole] = useState(0);
  const [initials, setInitials] = useState("");
  const [user, setUser] = useState(null)
  const [allTodaysSessions, setAllTodaysSessions] = useState([])
  const [allUpcomingSessions, setAllUpcomingSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState(0)
  const [globalMessageInput, setGlobalMessageInput] = useState("")
  const [profilePic, setProfilePic] = useState({})
  const navigate = useNavigate()


    const handleInputChange = (e) => {
      setGlobalMessageInput(e.target.value)
    }

const getToday = () => {
  const dateObj = new Date();
  const year = dateObj.getFullYear().toString();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); 
  const day = dateObj.getDate().toString().padStart(2, '0'); 
  const date = `${year}-${month}-${day}`; 
  setToday(date)
}

  const openGlobalMessageModal = () => {
    if (isMenuOpen) {
      return
    }
    if (userRole > 1999) {
      setIsGlobalMessageModalOpen(true);
    }
  };

  const closeGlobalMessageModal = () => {
    if (userRole > 1999) {
      setIsGlobalMessageModalOpen(false);
    }
  };

  const openAdminModal = () => {
    if (userRole > 1999) {
      setIsAdminModalOpen(true);
    }
  };

  const closeAdminModal = () => {
    if (userRole > 1999) {
      setIsAdminModalOpen(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/")
      return
    }
    setIsLoading(true)
    const decodedToken = jwtDecode(token);
    setRole(decodedToken.role);
    setUser({ name: decodedToken.name, lastname: decodedToken.lastname });
    getToday()


    try{
      fetchGlobalMessage()
      getUser(token)
      if (today !== ""){
      getSessions(token, today)
    }

    } catch (err) {
      console.error("Error fetching data", err)
    } finally {
      setIsLoading(false)
    }

 
  }, [today]);


    const getUser = async (token) => {
    if (!token) return
    if (token && today) {

      fetch("http://192.168.0.30:5000/get-user", {
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
          setProfilePic({profileImage: data.user.profileImage, thumbnailImage: data.user.thumbnailImage})
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
  
      })
      .finally(() => {
      }
  )} 
}



const getSessions = async (token, today) => {
  if (!token) return;
  const decodedToken = jwtDecode(token)
  try {
    const response = await fetch("http://192.168.0.30:5000/get-sessions", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
  
    const data = await response.json();
    const sessions = data.sessions;
    const currentTime = new Date();
  
    // Sort sessions by date and time
    const sortedSessions = sessions.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
  
    // Determine today's and upcoming sessions
    const todaySessions = sortedSessions.filter(session => {
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      const twoHoursLater = new Date(sessionDateTime.getTime() + 2 * 60 * 60 * 1000);
      return session.date === today && twoHoursLater > currentTime;
    });
    
    const upcomingSessions = sortedSessions.filter(session => {
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      return sessionDateTime > currentTime && session.date > today;
    });
    

      setAllTodaysSessions(todaySessions);
      setAllUpcomingSessions(upcomingSessions);
    
  
  } catch (err) {
    console.error("Couldn't get sessions", err);
  }
};


  

  const message = async (message) => {
  setIsAdminModalOpen(false);

  if (message === null || message.trim() === "") {
     setGlobalMessage(""); 
     closeGlobalMessageModal()
    return false
  }
  closeGlobalMessageModal()

  setGlobalMessage(message);
  await postMessage(message);
  fetchGlobalMessage()

};
  const postMessage = async (message) => {
    const token = localStorage.getItem("token")
    if (!token) return
    if (token) {
    try {
      setIsLoading(true)
      const response = await fetch(
        "http://192.168.0.30:5000/admin/post-global-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            globalMessage: message.trim(),
            author: initials,
            coach: user.email,
            thumbnailImage: profilePic.thumbnailImage ? profilePic.thumbnailImage : null
          }),
        },
      );

      if (response.ok) {
        setGlobalMessage(message)
      }

    } catch (err) {
      console.error("Något gick fel vid postning av meddelande", err);
    } finally {
      setIsLoading(false)
     }
    } else {
      navigate("/login")
    }
  };



const getDayOfWeek = (dateString) => {
 
  const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  

  const date = new Date(dateString);
  
 
  return days[date.getDay()];
}

const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  const formattedDate = dateObj.toLocaleDateString('sv-SE', {
    day: '2-digit',
    month: '2-digit'
  });

  // Ta bort inledande nollor från månad och dag
  const [month, day] = formattedDate.split('/').map(part => parseInt(part, 10));
  const formattedMonth = month < 10 ? month.toString() : month;
  const formattedDay = day < 10 ? day.toString() : day;

  return `${formattedMonth}/${formattedDay}`;
};


 const fetchGlobalMessage = async () => {
   const token = localStorage.getItem("token")
  const decodedToken = jwtDecode(token)
  const role = decodedToken.role
  try {
    const response = await fetch("http://192.168.0.30:5000/get-global-message", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.globalMessage.globalMessage === "") {
        setGlobalMessage("");
        if (data.globalMessage.likes)  {
          setGlobalMessageLike(data.globalMessage.likes.length)
        }
      } else if (role > 2000){ // admin hämtar alla meddelanden, alltså i en array
        // Därför tar vi det sista
     
        if (data.globalMessage[data.globalMessage.length -1].likes)  {
          setGlobalMessageLike(data.globalMessage[data.globalMessage.length -1].likes.length)
        }
        setGlobalMessage(data.globalMessage[data.globalMessage.length -1])
      } else {
        setGlobalMessage(data.globalMessage);
      }
    } else {
      console.error("Failed to fetch global message");
    }

  } catch (error) {
    console.error("Error fetching global message:", error);
  } 
}; 


const deleteGlobalMessage = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
      const response = await fetch("http://192.168.0.30:5000/admin/delete-global-message", {
          method: "DELETE",
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              messageId: globalMessage._id 
          })
      });

      if (response.ok) {
          console.log("Globalt meddelande raderat");
          setGlobalMessage("");  
          setIsGlobalMessageModalOpen(false);  
      } else {
          console.error("Misslyckades med att radera det globala meddelandet");
      }
  } catch (error) {
      console.error("Error deleting global message:", error);
  } finally {

  }
};
 
  
  const handleSessionClick = (sessionId) => {
    if (isMenuOpen) {
      return;
    }

    navigate('/my-sessions', { state: { selectedSession: sessionId } });
  };

  const adminDashboard = () => {
    navigate("/admin-dashboard")
  }

  const likeGlobalMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://192.168.0.30:5000/like-global-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          messageId: globalMessage._id,
        }),
      });

      if (response.ok) {
        const updatedLikes = globalMessage.likes?.includes(`${user.name} ${user.lastname}`)
          ? globalMessage.likes.filter(name => name !== `${user.name} ${user.lastname}`)
          : [...globalMessage.likes, `${user.name} ${user.lastname}`];

        setGlobalMessage({
          ...globalMessage,
          likes: updatedLikes,
        });
        setGlobalMessageLike(updatedLikes.length);
      }
    } catch (err) {
      console.error("Error toggling like on global message:", err);
    }
  };
   
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
      <AdminButton />

    {!isLoading &&
      <div className="home-wrapper">
        <div className="view-header">
          <h1>
            <Greeting/> {name}! 
          </h1>
        </div>
        {globalMessage && typeof globalMessage === "object" && (
          <div className="global-message">
            {globalMessage !== null &&
              globalMessage !== "" && (
                <>
                  <span className="global-message-author">
                    {globalMessage.thumbnailImage ? (
                    <img className="author-avatar" alt="thumbnail" src={globalMessage.thumbnailImage }/>
                    ) : (
                    <h3 id="author">{globalMessage.author}</h3> )
                }
                    
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
              <div className="like-wrapper">
                <span className="heart-icon">
                  <FontAwesomeIcon
                    icon={globalMessage.likes?.includes(`${user.name} ${user.lastname}`) ? faHeart : faHeartRegular}
                    onClick={likeGlobalMessage}
                  />
                </span>
                <p>{globalMessageLike > 0 ? globalMessageLike : ""}</p>
              </div>
            </div>
        )}

        

                  {userRole >= 2000 && (
               <div className="menu-icon">
               <FontAwesomeIcon className="admin-button" onClick={openAdminModal} icon={faPlus}/>
   {/*             <img
                 src="./plus-icon.svg"
                 alt="plus-icon"
                 onClick={openAdminModal}
                 className="admin-button"
               /> */}
             </div>
                    )}



{!isLoading && allTodaysSessions.length > 0 ? (
  <div to="my-sessions" className="sessions-wrapper">
    <div className="sessions-header">
      <h2>Dagens Pass</h2>
    </div>
    {allTodaysSessions.map((session, sessionIndex) => {

      return (
        <div className="sessions" key={sessionIndex}>
          <div className="sessions-content" onClick={() => handleSessionClick(session)}>
            <div className="session-top">
              <h2>
                {getDayOfWeek(session.date)} {session.time}
              </h2>
              <h2><Weather sessionDate={session.date ? session.date : today}
                sessionTime={session.time ? session.time : "12:00"}/></h2>
            </div>

            <div className="session-center">
              <h2>{session.title}</h2>
            </div>


            <div className="session-bottom">
              <h2>{session.place}</h2>
              <div className="session-initials">
                {session.attendees.map((attendee, index) => (
                  <span key={index} className="initials-wrapper">
                    {attendee.thumbnailImage ? (
                      <img src={attendee.thumbnailImage} alt="thumbnail"  className="author-avatar"/>
                    ) : (
                      <h3 id="initials">{attendee.name[0] + attendee.lastname[0]}</h3>
                    )}
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
    <h2>Du har inga kommande pass idag</h2>
    </div>
  </div>
)}






  <div className="sessions-wrapper">
    <div className="sessions-header">
      <h2>Kommande Pass</h2>
    </div>
    {allUpcomingSessions.map((session, index) => {
        return (
          <div className="sessions" key={index}>
            <div className="sessions-content" onClick={() => handleSessionClick(session)}>
              <div className="session-top">
              <h2>{getDayOfWeek(session.date)} {formatDate(session.date)} {session.time}</h2>
                <h2><Weather sessionDate={session.date ? session.date : ""}
                sessionTime={session.time ? session.time : "12:00"} /></h2>

              </div>

              <div className="session-center">
              <h2>{session.title}</h2>
            </div>

              <div className="session-bottom">
              <h2>{session.place}</h2>
              <div className="session-initials">
                {session.attendees.map((attendee, index) => (
                  <span key={index} className="initials-wrapper">
                    {attendee.thumbnailImage ? (
                      <img src={attendee.thumbnailImage} alt="thumbnail"  className="author-avatar"/>
                    ) : (
                      <h3 id="initials">{attendee.name[0] + attendee.lastname[0]}</h3>
                    )}
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
                <h2>Posta eller ta bort globalt meddelande</h2>
              </div>

              <div>
                  <input type="text" value={globalMessageInput} onChange={handleInputChange}/>
              </div>

              <div className="modal-buttons">

                <button
                  className="modal-delete-button"
                  onClick={deleteGlobalMessage}
                >
                  Ta bort
                </button>
                <button className="modal-button" onClick={ () => message(globalMessageInput)}>
                  Posta
                </button>
              </div>
            </div>
          </Modal>
        </div>

        <div id="modal-root">
          <Modal isOpen={isAdminModalOpen} onClose={closeAdminModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
              </div>

              <div className="admin-modal">

              <Link
                  to="/add-athlete"
                  className="admin-modal-item"
                  onClick={closeAdminModal}
                >
                  <h2>Lägg till atlet</h2>
                </Link>

                <Link
                  to="/add-exercise"
                  className="admin-modal-item"
                  onClick={closeAdminModal}
                >
                  <h2>Lägg till övning</h2>
                </Link>

                <Link
                  to="/add-session"
                  className="admin-modal-item"
                  onClick={closeAdminModal}
                >
                  <h2>Lägg till pass</h2>
                </Link>

                <div className="admin-modal-item" onClick={openGlobalMessageModal}>
                  <h2>Skriv globalt meddelande</h2>
                </div>

                <div className="admin-modal-item-center" onClick={adminDashboard}>
                  <h2>Dashboard</h2>
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
        <Footer />
      </div>
      } 
    </div>
  );
}
