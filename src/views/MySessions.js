import React, {useState, useEffect, useContext, useRef, useLayoutEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/mySessions.css";
import MenuContext from "../context/MenuContext.js";
import Header from '../components/Header';
import Menu from '../components/Menu';
import {jwtDecode} from "jwt-decode"; 
import Modal from "../components/Modal"
import Loader from "../components/Loader"
import Weather from "../components/Weather"
import Footer from "../components/Footer"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import AdminButton from '../components/AdminButton';




export default function MySessions() {
    const navigate = useNavigate()
    const location = useLocation();
    const selectedSession = location.state ? location.state.selectedSession : "";
    const [today, setToday] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
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
    const [expandedContent, setExpandedContent] = useState(selectedSession);
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const [comment, setComment] = useState("")
    const [currentSessionId, setCurrentSessionId] = useState("")
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [sessionXValues, setSessionXValues] = useState({});
    const [sessionToRemoveId, setSessionToRemoveId] = useState('');
    const [sliderValue, setSliderValue] = useState(0)
    const [notSignedSessions, setNotSignedSessions] = useState([]); 
    const [summaryComment, setSummaryComment] = useState("")
    const [showPastSessions, setShowPastSessions] = useState(false)
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPastSessions, setFilteredPastSessions] = useState([]);
    const [result, setResult] = useState(0)
    const [unit, setUnit] = useState("")

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

      const handleResultChange = (e) => {
          let value = e.target.value
          if(value.includes(",")) {
           value = value.replace(",",".")
          }

          setResult(value)
      }
      const handleUnitChange = (e) => {
        setUnit(e.target.value)
      }


      const handleSummaryCommentChange = (e) => {
          setSummaryComment(e.target.value)
      }
    
      const getToday = () => {
        const dateObj = new Date();
        const year = dateObj.getFullYear().toString();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); 
        const day = dateObj.getDate().toString().padStart(2, '0'); 
        const date = `${year}-${month}-${day}`; 
        setToday(date)
      }
      
      const getSessions = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
    
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role;
        setRole(role);
        setUser({ name: decodedToken.name, lastname: decodedToken.lastname, email: decodedToken.email });
    
        if (token) {
            try {
                setIsLoading(true);
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
                const currentTime = new Date();
    
                // Sort all sessions based on time and date
                const sortedSessions = sessions.sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateA - dateB; // Sortera i stigande ordning (äldsta först)
                });
    
                // Funktion för att kontrollera om en session är förfluten
                const sessionIsPast = (session) => {
                    const sessionTime = new Date(`${session.date}T${session.time}`);
                    const twoHourPast = new Date(sessionTime.getTime() + 120 * 60 * 1000);
                    return currentTime > twoHourPast;
                };
    
                if (role >= 2000) {

                    setAllUpcomingSessions(sortedSessions.filter(session => !sessionIsPast(session)));
                    setAllPastSessions(sortedSessions.filter(sessionIsPast).reverse());
                } else {
                    const userSessions = sortedSessions.filter(session => session.attendees.some(attendee => attendee.email === decodedToken.email));
                    setAllUpcomingSessions(userSessions.filter(session => !sessionIsPast(session) && !session.attendees.find(attendee => attendee.email === decodedToken.email).signed));
                    setAllPastSessions(userSessions.filter(session => sessionIsPast(session) && session.attendees.find(attendee => attendee.email === decodedToken.email).signed).reverse())
                    const notSignedSessions = userSessions.filter(session => sessionIsPast(session) && !session.attendees.find(attendee => attendee.email === decodedToken.email).signed).reverse();
                    setNotSignedSessions(notSignedSessions);
                }
            } catch (err) {
                console.error("Couldn't get sessions", err);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    


    const postComment = async () => {
        const token = localStorage.getItem("token");
        if (!token) return
        try {
          const response = await fetch(`https://appleet-backend.vercel.app/add-comment/${currentSessionId}/${currentExercise._id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: user.email,
              userComment: comment.trim() !== "" ? comment.trim() : "",
              result: result + unit,
              author: user.name[0] + user.lastname[0]
            }),
          });

          setComment("")
          closeModal()
        
          if (response.ok) {
            console.log("Kommentaren postades framgångsrikt!");
            getSessions();
            setUnit("")
            setResult("")
          } else {
            console.error("Något gick fel när du försökte posta kommentaren.");
          }
        } catch (error) {
          console.error("Ett fel uppstod vid hantering av kommentaren:", error);
        }
      };


      const deleteSession = async () => {
        const token = localStorage.getItem("token");
        if (!token) return
        try {
            const response = await fetch(`https://appleet-backend.vercel.app/${sessionToRemoveId}`, {
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


    const submitSession = async (sessionId) => {
        console.log(sessionId)
        const token = localStorage.getItem("token");
        if (!token) return

        try {
            const response = await fetch(`https://appleet-backend.vercel.app/update-session/${sessionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    summaryComment: summaryComment,
                    email: user.email,
                    howDidSessionGo: sliderValue,
                    signed: true

                  }),
            });
    
            if (response.ok) {
                console.log("Passet har färdigmarkerats framgångsrikt!");
                getSessions(); 
            } else {
                console.error("Något gick fel när du försökte färdigmarkera passet.");
            }
        } catch (error) {
            console.error("Ett fel uppstod vid hantering av färdigmarkering av passet:", error);
        }
    };
    

    const toggleExpandContent = (session, e) => {
        console.log(session)
        if (e?.target?.tagName.toLowerCase() === 'input' || e?.target?.tagName.toLowerCase() === 'button' || e?.target?.tagName.toLowerCase() === 'h3') {
            return; 
        }
        setExpandedContent(prevContent => {
            if (!session || (prevContent && prevContent._id === session._id)) {
                return ""; 
            } else {
                return session;
            }
        });
    };


    useEffect(() => {
        setTimeout(() => {
            const selectedSessionElement = document.querySelector(".sessions-expandable.expanded");                
                    if (selectedSessionElement) {
                        selectedSessionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        console.log("scrolled")
                    }        
    }, 500)
    }, [expandedContent]);

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }

        try {
            setIsLoading(true)
        getToday()
        getSessions();
    } catch(err){
        console.error("Something went wrong with fetching data:", err)
    } finally {
        setIsLoading(false)
    }

    }, []);

  

    const isContentExpanded = (session) => {
        const isExpanded = expandedContent && expandedContent._id === session._id;
        return isExpanded;
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
        if (role >= 2000) {
            
            if (expandedContent === "") {
                const deltaX = e.touches[0].clientX - touchStartX;
    
                if (deltaX < 0) {
                    setSessionXValues(prevValues => ({
                        ...prevValues,
                        [sessionId]: deltaX,
                    }));
                }
            }
        }
    };
    
    const handleTouchEnd = (sessionId) => {
        if (role >= 2000) {
            if (expandedContent === "") {
                const deltaX = sessionXValues[sessionId] || 0;
                if (Math.abs(deltaX) > 200) {
                    openDeleteModal(sessionId);
                }
    
                setSessionXValues(prevValues => ({
                    ...prevValues,
                    [sessionId]: 0,
                }));
            }
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
        

        if (Math.abs(deltaX) <= 100) {
            return 'rgba(187, 186, 186,0.5)'
        } else{
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`
    }
    };


    const handleSliderValue = (e) => {
        setSliderValue(e.target.value)
    }

    const toggleShowPastSessions = () => {
        setShowPastSessions(prevShow => !prevShow); // Växla mellan true och false
    };

    const handleSearch = (e) => {
        const value = e.target.value.trim();
        setSearchTerm(value);
    
        if (value) {
            
            const filteredSessions = allPastSessions.filter(session => {
                const sessionDate = new Date(session.date);
                const sessionDateString = sessionDate.toISOString().slice(0, 10); // 'YYYY-MM-DD'
                const sessionYearMonth = sessionDate.toISOString().slice(0, 7); // 'YYYY-MM'
    
               
                return sessionDateString === value || sessionYearMonth === value;
            });
            setFilteredPastSessions(filteredSessions);
        } else {
            setFilteredPastSessions(allPastSessions);
        }
    };

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
                    
                    <div className="modal-result-row">
                     <input type="text"
                    className="input-name"
                         onChange={handleResultChange}
                             value={result}
                             placeholder="Resultat">
                     </input>

                     <select onChange={handleUnitChange}>
                     <option>Välj enhet</option>
                         <option value="m">m</option>
                         <option value="cm">cm</option>
                         <option value="s">s</option>
                         <option value="h">h</option>
                         <option value="min">min</option>
                         <option value="kg">kg</option>
                     </select>
                     </div>

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

        
        


            {isLoading &&
            <Loader/>
        }
            <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef} />
            <AdminButton />
         
            <div className="home-wrapper">
             <div className="view-header">
                 <h1>Mina Pass</h1>
              </div>


                    <div className="sessions-wrapper">
    <div className="sessions-header">
        <h2>Kommande pass</h2>
        {allUpcomingSessions.length > 0 &&
        <h3 className="sessions-number">{allUpcomingSessions.length}</h3>
        }
    </div>
    {allUpcomingSessions.map((session, index) => (
        <div
            id={expandedContent ? expandedContent._id : ""}
            key={session._id}
            className={"sessions-expandable" + (isContentExpanded(session) ? " expanded" : "")}
            style={{
                transform: `translateX(${sessionXValues[session._id]}px)`,
            }}
            onClick={(e) => toggleExpandContent(session, e)}
            onTouchStart={(e) => handleTouchStart(session._id, e)}
            onTouchMove={(e) => handleTouchMove(session._id, e)}
            onTouchEnd={() => handleTouchEnd(session._id)}
        >
            <div className="sessions-content" style={{ backgroundColor: calculateSwipeColor(session._id) }}>
                <div className="session-top">
                    <h2> {getDayOfWeek(session.date)} {formatDate(session.date)} {session.time}</h2>
                    <h2><Weather sessionDate={session.date ? session.date : today}
                        sessionTime={session.time ? session.time : "12:00"}/></h2>
                </div>

                {!isContentExpanded(session) &&
                <div className="session-center">
                    <h2>{session.title}</h2>
                </div>
                }

                {isContentExpanded(session) && (
                <div className="expanded-session-content">
                    {session.exercises.map((exercise, exerciseIndex) => {                           
                                const resultsByAuthor = (exercise.results && Array.isArray(exercise.results)) ? exercise.results.reduce((acc, result) => {
                                    if (acc[result.author]) {
                                        acc[result.author].push(result.value);
                                    } else {
                                        acc[result.author] = [result.value];
                                    }
                                    return acc;
                                }, {}) : {};
                              

                        return (
                            <div id="exercise-item" key={exerciseIndex}>
                                <h3 id="exercise-name" onClick={(e) => openModal(session, exercise)}>{exercise.name}</h3>
                                <p id="exercise-description">{exercise.description}</p>

                                {Object.keys(resultsByAuthor).length > 0 && (
                                <div className="result-row comment-container">
                                    {Object.entries(resultsByAuthor).map(([author, values], index) => (
                                        <p key={index} id="exercise-comment">{author}: {values.join(", ")}</p>
                                    ))}
                                </div>
                                )}

                                {exercise.userComments && exercise.userComments.map((userComment, userCommentIndex) => (
                                    <div key={userCommentIndex} className="comment-container">
                                        {userComment.comment && <p id="exercise-comment">{userComment.author}: {userComment.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
                )}

                <div className="session-bottom">
                    <h2>{session.place}</h2>
                    <div className="session-initials">
                          {session.attendees.map((attendee, index) => (
                              <span key={index} className="initials-wrapper">
                            {attendee.thumbnailImage  ? (
                            <img src={attendee.thumbnailImage} alt="Profilbild" className="author-avatar"/>
                            ) : (
                            <h3 id="initials">{attendee.name[0] + attendee.lastname[0]}</h3>
                         )}
                  </span>
                ))}
              </div>
                </div>
            </div>
        </div>
    ))}


                </div>

                {role === 1000 && notSignedSessions.length > 0 && (
    <div className="sessions-wrapper">
        <div className="sessions-header">
        
                    <h2>Ej färdigmarkerade</h2>
                    <h3 className="sessions-number-red">{notSignedSessions.length}</h3>

       
        </div>
        {notSignedSessions.map((session, index) => (
            <div className={"sessions-expandable" + (isContentExpanded(session) ? " expanded" : "")} key={index} onClick={(e) => toggleExpandContent(session, e)}> 
                <div className="sessions-content">
                    <div className="session-top">
                        <h2>{getDayOfWeek(session.date)} {formatDate(session.date)} {session.time}</h2>
                    </div>

                    {!isContentExpanded(session) &&
                                    <div className="session-center">
                                       <h2>{session.title}</h2>
                                     </div>
                                    }

                    {isContentExpanded(session) && (
                        <div className="expanded-session-content">
                            {session.exercises.map((exercise, exerciseIndex) => (
                                <div id="exercise-item" key={exerciseIndex}>
                                    <h3 id="exercise-name" onClick={(e) => openModal(session, exercise)}>{exercise.name}</h3>
                                    <p id="exercise-comment">{exercise.comment}</p>
                                    {exercise.userComment && exercise.userComment.map((userComment, userCommentIndex) => (
                                        <p key={userCommentIndex} id="exercise-comment">{userComment.author}: {userComment.comment}</p>
                                    ))}
                                </div>
                            ))}

                            <div className="session-brief-wrapper">
                                <div className="session-brief-header">
                                    <p id="exercise-comment">Hur gick passet?</p>
                                </div>
                                <div className="session-brief-slider">
                                    <input 
                                        className='slider-input'
                                        type="range" 
                                        min="0" 
                                        max="10"
                                        value={sliderValue}
                                        onChange={handleSliderValue}
                                    />
                                    <p>{sliderValue}</p>
                                </div>

                                <div>
                                    <input
                                        className="input-name"
                                        type="text"
                                        placeholder="Lägg till kommentar"
                                        value={summaryComment}
                                        onChange={handleSummaryCommentChange}
                                    />
                                </div>

                                <div className="submit-session">
                                    <button className="submit-button" onClick={() => submitSession(session._id)}>Färdigmarkera</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="session-bottom">
                        <h2>{session.place}</h2>
                        <div className="session-initials">
                          {session.attendees.map((attendee, index) => (
                              <span key={index} className="initials-wrapper">
                            {attendee.profileImage ? (
                            <img src={attendee.profileImage} alt="Profilbild" className="author-avatar"/>
                            ) : (
                            <h3 id="initials">{attendee.name[0] + attendee.lastname[0]}</h3>
                         )}
                  </span>
                ))}
              </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
)}



                 

<div className="sessions-wrapper">
    <div className="sessions-header">
        <h2 onClick={() => toggleShowPastSessions()}>Tidigare pass</h2>
        {showPastSessions &&
            <input
                id="date-filter"
                type="text" 
                value={searchTerm}
                onChange={handleSearch}
                placeholder="YYYY-MM-DD"
            />
        }
        <img
            id="arrow"
            src="/arrow.png"
            alt="arrow-icon"
            onClick={() => toggleShowPastSessions()}
            style={{ transform: showPastSessions ? "rotate(90deg)" : "rotate(-90deg)" }}
        />
    </div>
    {showPastSessions && (
        (searchTerm ? filteredPastSessions : allPastSessions).map((session, index) => (
            <div className={"sessions-expandable" + (isContentExpanded(session) ? " expanded" : "")} key={index} onClick={(e) => toggleExpandContent(session, e)}>
                <div className="sessions-content">
                    <div className="session-top">
                        <h2>{getDayOfWeek(session.date)} {session.date} {session.time}</h2>
                    </div>

                    {!isContentExpanded(session) &&
                                    <div className="session-center">
                                       <h2>{session.title}</h2>
                                     </div>
                                    }
                                    
                    {isContentExpanded(session) && (
                        <div className="expanded-session-content">
                            {session.exercises.map((exercise, exerciseIndex) => (
                                <div id="exercise-item" key={exerciseIndex}>
                                    <h3 id="exercise-name" onClick={(e) => openModal(session, exercise)}>{exercise.name}</h3>
                                    <p id="exercise-comment">{exercise.comment}</p>
                                    {exercise.userComment && exercise.userComment.map((userComment, userCommentIndex) => (
                                        <p key={userCommentIndex} id="exercise-comment">{userComment.author}: {userComment.comment}</p>
                                    ))}
                                </div>
                            ))}
                            <div className="session-results-wrapper">
                                {session.attendees.map((result, resultIndex) => (
                                <div key={resultIndex} className="session-results"> 
                                <p id="result-name">{result.name} {result.lastname}</p>
                                <p id="result-score">{result.howDidSessionGo}/10</p>
                                <p id="result-comment">{result.summaryComment}</p>
                                </div>
                                
                               ))}
                            </div>
                        </div>
                    )}
                    <div className="session-bottom">
                        <h2>{session.place}</h2>
                        <div className="session-initials">
                          {session.attendees.map((attendee, index) => (
                              <span key={index} className="initials-wrapper">
                            {attendee.thumbnailImage ? (
                            <img src={attendee.thumbnailImage} alt="Profilbild" className="author-avatar"/>
                            ) : (
                            <h3 id="initials">{attendee.name[0] + attendee.lastname[0]}</h3>
                         )}
                  </span>
                ))}
              </div>
                    </div>
                </div>
            </div>
        ))
    )}
</div>





                                    <Footer/>
            </div>
        </div>
    );
}
