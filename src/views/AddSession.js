import React, { useContext, useRef, useEffect, useState } from "react";
import "../styles/addSession.css";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuContext from "../context/MenuContext";
import Modal from "../components/Modal.js";



export default function AddSession() {
  const hamburgerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [users, setUsers] = useState([]);
  const [exerciseArray, setExerciseArray] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [exerciseCategories, setExerciseCategories] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [sessionArray, setSessionArray] = useState([]);
  const [comment, setComment] = useState(""); 
    console.log(typeof selectedExercise)

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

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handlePlaceChange = (e) => {
    setSelectedPlace(e.target.value);
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
    console.log(selectedAttendees);
    console.log(selectedExercise);
    console.log(selectedExercises);
  }, [selectedAttendees, selectedExercises, selectedExercise]);

  useEffect(() => {
    async function getUsers() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            "http://192.168.0.36:5000/get-all-users",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
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
          const response = await fetch(
            "http://192.168.0.36:5000/get-exercises",
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
    if (newComment !== null) { // Ensure a comment is provided
      setSelectedExercises(prevExercises =>
        prevExercises.map(exercise => {
          if (exercise.name === selectedExercise.name) {
            return { ...exercise, comment: newComment }; // Add comment to the selected exercise
          }
          return exercise;
        })
      );
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
      <Menu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        hamburgerRef={hamburgerRef}
      />
      <div
        className="home-wrapper-exercises"
        style={{
          filter: isMenuOpen
            ? "blur(4px) brightness(40%)"
            : "blur(0) brightness(100%)",
        }}
      >
        <h1 className="view-header">Skapa pass</h1>

        

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
                {user.name}
              </button>
            ))}
          </div>
)}

          <div className="date-time-header">
            <h2 className="header-text">Datum</h2>
            <h2 className="header-text">Tid</h2>
          </div>

          <div className="datetime-wrapper">
            <div className="datetime-picker">
              <input
                type="text"
                placeholder="YYYY-MM-DD"
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
            <h2 className="header-text">Plats</h2>
            <input
              type="text"
              value={selectedPlace}
              onChange={handlePlaceChange}
            />
          </div>

          <div className="add-exercises">
            <div className="add-exercises-header">
              <h2 className="header-text">Lägg till övningar</h2>
            </div>

            <div className="expand-wrapper">
              {exerciseCategories.map((category) => (
                <div key={category}>
                  <div
                    className="expand"
                    onClick={() => toggleExpand(category)}
                  >
                    <h3>{category}</h3>
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
                    {exerciseArray.map((exercise) => {
                      if (exercise.category === category) {
                        return (
                          <button
                            key={exercise.name}
                            className="exercise-button"
                            onClick={() => addExercises(exercise)}
                          >
                            {exercise.name}
                          </button>
                        );
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
            {attendee.name}
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
      <h2 className="header-text">Övningar</h2>
      <div className="selected-exercises">
        {selectedExercises.map((exercise, index) => (
          <div key={exercise.name} className="exercise-item">
            <img
              src="/arrow.png"
              alt="arrow-icon"
              onClick={() => moveExerciseUp(index)}
              disabled={index === 0}
              className="up-button"
            />
             {exercise.comment && (
          <img id="commented-svg" src="/comment.svg" alt="commented-picture" />
        )}
            <button
              className="exercise-button"
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


            <div className="save-exercise-button">
              <button className="save-button">Spara pass</button>
            </div>
          </div>
        </div>

        <div id="modal-root">
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
                <h2>Ta bort eller kommentera övning</h2>
              </div>

               {selectedExercise.comment && (
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
      </div>
    </div>
  );
}
