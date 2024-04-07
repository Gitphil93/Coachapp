import React, {useState, useEffect, useContext, useRef} from 'react';
import "../styles/mySessions.css";
import MenuContext from "../context/MenuContext.js";
import Header from '../components/Header';
import Menu from '../components/Menu';
import {jwtDecode} from "jwt-decode"; 
import Modal from "../components/Modal"

export default function MySessions() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [currentExercise, setCurrentExercise] = useState('');
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
    const [comment, setComment] = useState("")
    const [currentSessionId, setCurrentSessionId] = useState("")
    const sessionSwipeRefs = useRef([]);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [sessionXValues, setSessionXValues] = useState({});
    const [sessionToRemoveId, setSessionToRemoveId] = useState('');

  
 

    const openModal = (session, exercise) => {
        setCurrentSessionId(session._id); 
        setCurrentExercise(exercise);
        setIsModalOpen(true);
      };
      const openDeleteModal = (sessionId) => {
        setSessionToRemoveId(sessionId);
        setIsDeleteModalOpen(true);
    };
   
      const closeModal = () => {
        setIsModalOpen(false);
      };
      const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
      };

      const handleComment = (e) => {
        setComment(e.target.value)
      }

      const getSessions = async () => {
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        setRole(decodedToken.role);
        setUser({name: decodedToken.name, lastname: decodedToken.lastname})
        console.log(decodedToken.email)

        if (token) {
            try {
                const response = await fetch(
                    "https://appleet-backend.vercel.app/get-sessions",
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
                    const userSessions = sessions.filter(session => session.attendees.map(attendee => attendee.email).includes(decodedToken.email));
                    console.log("userSessions", userSessions)
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

    useEffect(() => {
        getSessions();
    }, [role]);

    const postComment = async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`https://appleet-backend.vercel.app/add-comment/${currentSessionId}/${currentExercise._id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userComment: comment,
              author: user.name[0] + user.lastname[0]
            }),
          });

          setComment("")
          closeModal()
      
          console.log(response)
        
          if (response.ok) {
            console.log("Kommentaren postades framgångsrikt!");
            getSessions();
          } else {
            console.error("Något gick fel när du försökte posta kommentaren.");
          }
        } catch (error) {
          console.error("Ett fel uppstod vid hantering av kommentaren:", error);
        }
      };


      const deleteSession = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`https://appleet-backend.vercel.app/delete-session/${sessionToRemoveId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.ok) {
                console.log("Passet har tagits bort framgångsrikt!");
                // Uppdatera sessions efter borttagning
                getSessions();
                setIsDeleteModalOpen(false);
            } else {
                console.error("Något gick fel när du försökte ta bort passet.");
            }
        } catch (error) {
            console.error("Ett fel uppstod vid hantering av borttagning av passet:", error);
        }
    };
      
      

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


    const handleTouchStart = (sessionId, e) => {
        if(role >= 2000) {
        setTouchStartX(e.touches[0].clientX);
    }
    };
    
    
    const handleTouchMove = (sessionId, e) => {
        if(role >= 2000) {
        const deltaX = e.touches[0].clientX - touchStartX;

        setSessionXValues(prevValues => ({
            ...prevValues,
            [sessionId]: deltaX,
        }));
    };
}  

    const handleTouchEnd = (sessionId) => {
        if(role >= 2000) {
        const deltaX = sessionXValues[sessionId] || 0;
        if (Math.abs(deltaX) > 200) {
            openDeleteModal(sessionId);
        }
    
        setSessionXValues(prevValues => ({
            ...prevValues,
            [sessionId]: 0,
        }));
    }
    };

    const calculateSwipeColor = (sessionId) => {
        const deltaX = sessionXValues[sessionId] || 0;
        const maxSwipeDistance = 200; 
        const swipeRatio = Math.min(Math.abs(deltaX) / maxSwipeDistance, 1); // Andel av maximalt avstånd
        const red = Math.round(255 * swipeRatio);
        const green = 0; 
        const blue = 0; 
        const alpha = 1; 
        console.log(red,green,blue,alpha)

        if (Math.abs(deltaX) <= 100) {
            return 'linear-gradient(to bottom right, rgb(235, 233, 233) 50%, rgb(4, 52, 85))'
        } else{
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`
    }
    };

    return (
        <div>
                    <div id="modal-root">
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
                <h2 className="modal-h2">{currentExercise.name}</h2>
              </div>

                 <div className="modal-content">
                    <input type="text"
                    className="input-name"
                         onChange={handleComment}
                             value={comment}
                             placeholder="Skriv kommentar">
                     </input>
                </div>
                

              <div className="modal-buttons">
                <button className="modal-button" onClick={postComment}>Kommentera</button>
              </div>
            </div>
          </Modal>
        </div>


        <div id="modal-root">
          <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
                  <h2>Är du säker på att du vill ta bort passet?</h2>
              </div>

                 <div className="modal-content">
                </div>
                

              <div className="modal-buttons">
                <button className="modal-delete-button" onClick={deleteSession}>Ta bort</button>
              </div>
            </div>
          </Modal>
        </div>


            <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef} />

            <div className="home-wrapper" style={{ filter: isMenuOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>
                <h1 className="view-header">Mina pass</h1>

                <div  className="sessions-wrapper" >
                    <div className="sessions-header">
                        <h2>Kommande pass</h2>
                    </div>
                    {role >= 2000 ? (
                        allUpcomingSessions.map((session, index) => (
                            <div
                            className={"sessions-expandable" + (isContentExpanded(session) ? " expanded" : "")}
                            style={{
                                transform: `translateX(${sessionXValues[session._id]}px)`,
                            }}
                            onClick={() => toggleExpandContent(session)}
                            onTouchStart={(e) => handleTouchStart(session._id, e)}
                            onTouchMove={(e) => handleTouchMove(session._id, e)}
                            onTouchEnd={() => handleTouchEnd(session._id)}// Uppdatera sessionens position baserat på sessionX
                        >   
                                <div className="sessions-content" style={{ background: calculateSwipeColor(session._id)}}>
                                    <div className="session-top">
                                        <h2> {getDayOfWeek(session.date)} {session.date} {session.time}</h2>
                                    </div>

                                    
                                    {isContentExpanded(session) && (
                                <div className="expanded-session-content">
                                    {session.exercises.map((exercise, exerciseIndex) => (
                                    <div className="exercise-item" key={exerciseIndex}>
                                        <h3 id="exercise-name" onClick={ (e) => openModal(session, exercise)}>{exercise.name}</h3>
                                        {exercise.userComment && exercise.userComment.map((userComment, userCommentIndex) => (
                                        <p key={userCommentIndex} id="exercise-comment">{userComment.author}: {userComment.comment}</p>
                                        ))}
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
                                    <div className="exercise-item" key={exerciseIndex}>
                                        <h3 id="exercise-name" onClick={ (e) => openModal(session, exercise)}>{exercise.name}</h3>
                                        <p id="exercise-comment">{exercise.comment}</p>
                                        {exercise.userComment && exercise.userComment.map((userComment, userCommentIndex) => (
                                        <p key={userCommentIndex} id="exercise-comment">{userComment.author}: {userComment.comment}</p>
                                        ))}
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
                                    {session.exercises.map((exercise, exerciseIndex) => (
                                    <div className="exercise-item" key={exerciseIndex}>
                                        <h3 id="exercise-name" onClick={ (e) => openModal(session, exercise)}>{exercise.name}</h3>
                                        <p id="exercise-comment">{exercise.comment}</p>
                                        {exercise.userComment && exercise.userComment.map((userComment, userCommentIndex) => (
                                        <p key={userCommentIndex} id="exercise-comment">{userComment.author}: {userComment.comment}</p>
                                        ))}
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
                                    {session.exercises.map((exercise, exerciseIndex) => (
                                    <div className="exercise-item" key={exerciseIndex}>
                                        <h3 id="exercise-name" onClick={ (e) => openModal(session, exercise)}>{exercise.name}</h3>
                                        <p id="exercise-comment">{exercise.comment}</p>
                                        {exercise.userComment && exercise.userComment.map((userComment, userCommentIndex) => (
                                        <p key={userCommentIndex} id="exercise-comment">{userComment.author}: {userComment.comment}</p>
                                        ))}
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
