import React, { useContext, useRef, useEffect, useState } from "react";
import "../styles/addSession.css";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuContext from "../context/MenuContext";
import Modal from "../components/Modal.js";
import Loader from "../components/Loader.js"
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"
import Footer from "../components/Footer";
import Success from "../components/Success"
import AdminButton from "../components/AdminButton";



export default function AddSession() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const hamburgerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedName, setSelectedName] = useState("")
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [user, setUser] = useState({})
  const [users, setUsers] = useState([]);
  const [exerciseArray, setExerciseArray] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [exerciseCategories, setExerciseCategories] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [comment, setComment] = useState(""); 
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [isPostSessionSuccess, setIsPostSessionSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(true)
  const [exercisesInCategory, setExercisesInCategory] = useState({})

  console.log(exercisesInCategory)

  const openModal = (exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  const handleNameChange = (e) => {
    setSelectedName(e.target.value)
  }

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handlePlaceChange = (e) => {
    setSelectedPlace(e.target.value);
  };

  const openSearchModal = () => {
      setIsSearchModalOpen(true)
  }

  const closeSearchModal = () => {
    setIsSearchModalOpen(false)
    setSearchTerm("")
}

  const handleSearch = (e) => {
      setSearchTerm(e.target.value)
  }

  const filterExercises = () => {
    if (searchTerm.trim() === "") {
      setFilteredExercises([]); // Om söktermen är tom, sätt filtrerade övningar till en tom array
    } else {
      const filtered = exerciseArray.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  };

  useEffect(() => {
    filterExercises();
  }, [searchTerm]);

  const addFromSearch = (exercise) => {
    setSelectedExercises((prevExercises) => [...prevExercises, exercise]);
    setFilteredExercises((prevFiltered) =>
      prevFiltered.filter((item) => item.name !== exercise.name)
    );

    setIsSearchModalOpen(false);
  };

  const addAttendees = (user) => {
    setSelectedAttendees((prevAttendees) => [...prevAttendees, user]);
    setUsers((prevUsers) => prevUsers.filter((u) => u.name !== user.name));
  };

  const addExercises = (exercise) => {
    setSelectedExercises((prevExercises) => [...prevExercises, exercise]);
    setExerciseArray((prevExercises) =>
      prevExercises.filter((e) => e.name !== exercise.name),
    );
  };

  const addModuleExercises = (module) => {
    module.exercises.forEach((exercise) => {
      // Kopiera övningen och lägg till isModule-informationen
      const modifiedExercise = { ...exercise, isModule: true };
      console.log(modifiedExercise)
      setSelectedExercises((prevExercises) => [...prevExercises, modifiedExercise]);
    });
    setExerciseArray((prevExercises) =>
      prevExercises.filter((e) => e.name !== module.name),
    );
  };

  const moveExerciseUp = (index) => {
    if (index > 0) {
      const exercises = [...selectedExercises];
      const temp = exercises[index];
      exercises[index] = exercises[index - 1];
      exercises[index - 1] = temp;
      setSelectedExercises(exercises);
    }
  };

  const moveExerciseDown = (index) => {
    if (index < selectedExercises.length - 1) {
      const exercises = [...selectedExercises];
      const temp = exercises[index];
      exercises[index] = exercises[index + 1];
      exercises[index + 1] = temp;
      setSelectedExercises(exercises);
    }
  };

  const removeAttendee = (attendee) => {
    setSelectedAttendees((prevAttendees) =>
      prevAttendees.filter((a) => a.name !== attendee.name),
    );
    setUsers((prevUsers) => [...prevUsers, attendee]);
  };

  const removeExercise = (exercise) => {
    setSelectedExercises((prevExercises) =>
      prevExercises.filter((e) => e.name !== exercise.name),
    );
    setExerciseArray((prevExercises) => [...prevExercises, exercise]);
    setIsModalOpen(false);
  };

  useEffect(() => {
  }, [selectedAttendees, selectedExercises, selectedExercise]);

  useEffect(() => {
    async function getUsers() {
      const token = localStorage.getItem("token");
      if (!token) return
      const decodedToken = jwtDecode(token)
      setUser(decodedToken)
      if (token) {
        try {
          setIsLoading(true)
          const response = await fetch(
            "https://appleet-backend.vercel.app/get-all-users",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const data = await response.json();

          setUsers(data.users);
        } catch (err) {
          console.log(err, "Kunde inte hämta användarna");
        } finally {
           setIsLoading(false) 
        }
      }
    }
    getUsers()
if (isPostSessionSuccess) {
  getUsers();
  setIsPostSessionSuccess(false); 
}
}, [isPostSessionSuccess]);

  useEffect(() => {
    const token = localStorage.getItem("token")
      if (!token) return

    async function getExercises() {
      const token = localStorage.getItem("token");    
      if (!token) return
      if (token) {
        try {
          setIsLoading(true)
          const response = await fetch(
            "https://appleet-backend.vercel.app/get-exercises",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const data = await response.json();
          console.log(data);
          setExerciseArray(data);
          const categories = Array.from(
            new Set(data.map((exercise) => exercise.category)),
          );

          setExerciseCategories(categories);
        } catch (err) {
          console.log(err, "Kunde inte hämta övningarna");
        } finally {
             setIsLoading(false) 
        }
      }
    }
    getExercises();
  }, []);

  const toggleExpand = (category) => {
    setExpandedCategory((prevCategory) =>
      prevCategory === category ? null : category,
    );
  };


  const commentExercise = () => {
    const newComment = prompt("Kommentera övning");
    if (newComment !== null) { 
      setSelectedExercises(prevExercises =>
        prevExercises.map(exercise => {
          if (exercise.name === selectedExercise.name) {
            return { ...exercise, comment: newComment }
          }
          return exercise;
        })
      );
    }
    setIsModalOpen(false);
  };


  const postSession = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
      if (selectedAttendees.length === 0 || selectedTime === "" || selectedExercises.length === 0) {
          console.log("Fyll i alla fält")
          return false
      }

      if (token) {
      try{
        setIsLoading(true)
        const response = await fetch("https://appleet-backend.vercel.app/post-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              attendees: selectedAttendees.map(({ name, lastname, email, thumbnailImage }) => ({ name, lastname, email, thumbnailImage, signed: false })),
              title: selectedName.trim().charAt(0).toUpperCase() + selectedName.trim().slice(1),
              date: selectedDate.trim(),
              time: selectedTime.trim(),
              place: selectedPlace.trim().charAt(0).toUpperCase() + selectedPlace.trim().slice(1),
              exercises: selectedExercises,
              coach: user.email
            }),
          });

          if (response.ok) {
            const data = await response.json(); 


            selectedAttendees.forEach(async (attendee) => {
                console.log(1,data.session)
            
              });
        
              setComment("")
              setSelectedAttendees([])
              setSelectedExercises([])
              setSelectedDate("")
              setSelectedTime("")
              setSelectedPlace("")
              setSelectedName("")
              setShowNotification(true)
              setIsPostSessionSuccess(true);
              setExpandedCategory(false)
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
              
          }
  
      } catch (err) {
          console.error("Något gickfel vid postning av träningspass" , err)
      } finally {
         setIsLoading(false) 
      }
    } else {
      navigate("/login")
    }
  }

  const isExerciseFromModule = (exercise) => {
    // Kontrollera om `exerciseArray` är definierad och inte tom
    if (exerciseArray && exerciseArray.length > 0) {
      return selectedExercises.some((item) => item._id === exercise._id && item.isModule);
    }
    return false; // Returnera false om `exerciseArray` inte är definierad eller är tom
  };

  const updateCategoriesAndCounts = () => {
    if (!Array.isArray(exerciseArray) || exerciseArray.length === 0) {
      console.log('Inga övningar att bearbeta.');
      return;
    }
    const categoryCount = exerciseArray.reduce((acc, exercise) => {
      const { category } = exercise;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  
    // Säkerställ att alla kategorier behålls
    const allCategories = new Set([...exerciseCategories, ...Object.keys(categoryCount)]);
    setExerciseCategories([...allCategories]);
  
    setExercisesInCategory(categoryCount);
  };

  useEffect(() => {
    updateCategoriesAndCounts();
  }, [exerciseArray]);
  
  
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


      <div className="home-wrapper">
        <div className="view-header">
        <h1>Skapa pass</h1>
        </div>


        

        <div className="input-wrapper">
          <h2 className="header-text">Lägg till deltagare</h2>

          {users.length !== 0 && (
          <div className="attendees">
            {users.map((user) => (
              <button
                key={user.name}
                className="attendees-button"
                onClick={() => addAttendees(user)}
              >
                {user.name} {user.lastname}
              </button>
            ))}
          </div>
)}

          <div className="name-wrapper">
                <h2 className="header-text">Namn</h2>
                <input
                 className="input-name"
                 type="text"
                 value={selectedName}
                 onChange={handleNameChange}
             />
           </div>

          <div className="date-time-header">
            <h2 className="header-text">Datum*</h2>
            <h2 className="header-text">Tid</h2>
          </div>

          <div className="datetime-wrapper">
            <div className="datetime-picker">
              <input
                id="date-input"
                type="date"
                placeholder="YYYY-MM-DD"
                value={selectedDate}
                onChange={handleDateChange}
              />
              <input
                id="time-input"
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
              />
            </div>
          </div>

          <div className="place-wrapper">
            <h2 className="header-text">Plats</h2>
            <input
            className="input-name"
              type="text"
              value={selectedPlace}
              onChange={handlePlaceChange}
            />
          </div>

          <div className="add-exercises">
            <div className="add-exercises-header">
              <h2 className="header-text">Lägg till övningar</h2>

              {exerciseArray.length !== 0 &&
              <>
              <img id="search-svg" src="/search.svg" alt="search-svg" onClick={openSearchModal} />
              </>
              }
            </div>

            <div className="expand-wrapper">
              {exerciseCategories.map((category) => (
                <div key={category}>
                  <div
                    className="expand"
                    onClick={() => toggleExpand(category)}
                  >
                    <h3 id="category-header">{category}</h3>
                    <h3 id="number" className="category-number">{exercisesInCategory[category] || 0}</h3>
                    <img
                      id="arrow"
                      src="/arrow.png"
                      alt="arrow-icon"
                      style={{
                        transform:
                          expandedCategory === category
                            ? "rotate(90deg)"
                            : "rotate(-90deg)",
                      }}
                    />
                  </div>

                  <div
                    className={
                      expandedCategory === category
                        ? "expanded-content expanded"
                        : "expanded-content"
                    }
                  >
             {exerciseArray.map((item) => {
  if (item.category === category) {
    if (item.isModule) {
      return (
        <button
          key={item._id}
          className="module-button"
          onClick={() => addModuleExercises(item)}
        >
          {item.name}
        </button>
      );
    } else {
      return (
        <button
          key={item._id}
          className="exercise-button"
          onClick={() => addExercises(item)}
        >
          {item.name}
        </button>
      );
    }
  }
  return null;
})}
                  </div>
                </div>
              ))}
            </div>

            {selectedAttendees.length > 0 && (
  <div className="session-summary">
    <div className="session-summary-attendees">
      <h2 className="header-text">Deltagare</h2>
      <div className="attendees">
        {selectedAttendees.map((attendee) => (
          <button
            key={attendee.name}
            className="attendees-button"
            onClick={() => {
              removeAttendee(attendee);
            }}
          >
            {attendee.name} {attendee.lastname}
          </button>
        ))}
      </div>
    </div>
    <div className="session-summary-time-place">
      <h2 className="header-text">Tid och plats</h2>
      <div className="selected-time-place">
        <h3>
          {selectedDate} {selectedTime} {selectedPlace}
        </h3>
      </div>
    </div>

    <div className="session-summary-exercises">
      <div className="header-row">
      <h2 className="header-text">Övningar</h2>
      <h2 className="category-number">{selectedExercises.length}</h2>
      </div>
      <div className="selected-exercises">
        {selectedExercises.map((exercise, index) => (
          <div key={exercise._id} className="exercise-item">
            <img
              src="/arrow.png"
              alt="arrow-icon"
              onClick={() => moveExerciseUp(index)}
              disabled={index === 0}
              className="up-button"
            />
             {exercise.comment && (
          <img id="commented-svg" src="/comment.svg" alt="talk-bubble" />
        )}
            <button
             className={isExerciseFromModule(exercise) ? "module-button" : "exercise-button"}
              onClick={() => openModal(exercise)}
            >
              {exercise.name}
            </button>
            <img
              src="/arrow.png"
              alt="arrow-icon"
              onClick={() => moveExerciseDown(index)}
              disabled={index === selectedExercises.length - 1}
              className="down-button"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)}

              {selectedAttendees.length !== 0 &&
            <div className="save-exercise-button">
              <button className="save-button" onClick={postSession}>Spara pass</button>
            </div>
            }
          </div>
        </div>

        <div id="modal-root">
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="modal-wrapper">
              <div className="">
                <h2>Ta bort eller kommentera övning</h2>
              </div>

              {selectedExercise && selectedExercise.comment && (
                 <div className="exercise-comment">
                    <p>Kommentar: {selectedExercise.comment}</p>
                </div>
                )} 

              <div className="modal-buttons">
                <button className="modal-button" onClick={commentExercise}>Kommentera</button>
                <button
                  className="modal-delete-button"
                  onClick={() => removeExercise(selectedExercise)}
                >
                  Ta bort
                </button>
              </div>
            </div>
          </Modal>
        </div>


 
        <div id="modal-root">
          <Modal isOpen={isSearchModalOpen} onClose={closeSearchModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
                <h2>Sök övningar</h2>
              </div>

                <div>
                    <input className="input-name"
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        />
                </div>


                <div className="filtered-exercises">
        {filteredExercises.map((exercise) => (
          <button
            key={exercise._id}
            className="exercise-button"
            onClick={() => addFromSearch(exercise)}
          >
            {exercise.name}
          </button>
        ))}
      </div>


              <div className="modal-buttons">
                <button className="modal-button" onClick={closeSearchModal}>Stäng</button>

              </div>
            </div>
          </Modal>
        </div>

          <Footer/>
      </div>
    </div>
  );
}
