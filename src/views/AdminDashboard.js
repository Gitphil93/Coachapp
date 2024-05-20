import React, { useRef, useEffect, useState, useContext } from 'react';
import "../styles/adminDashboard.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import MenuContext from '../context/MenuContext';
import Loader from '../components/Loader';
import Menu from '../components/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from "jwt-decode";
import Modal from '../components/Modal';
import AdminButton from '../components/AdminButton';

export default function AdminDashboard() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleteExerciseModalOpen, setIsDeleteExerciseModalOpen] = useState(false)
    const hamburgerRef = useRef(null);
    const [user, setUser] = useState({});
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const [selectedUser, setSelectedUser] = useState("")
    const [exerciseArray, setExerciseArray] = useState([])
    const [exerciseCategories, setExerciseCategories] = useState([])
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState("")



    const openDeleteModal = (user) => {
        setSelectedUser(user)
        setIsDeleteModalOpen(true)
    }

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false)
    }

    const openDeleteExerciseModal = (exercise) => {
        setSelectedExercise(exercise)
        console.log(exercise)
        setIsDeleteExerciseModalOpen(true)
    }
    const closeDeleteExerciseModal = () => {
        setIsDeleteExerciseModalOpen(false)
    }


    const getUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decodedToken = jwtDecode(token);
        setUser(decodedToken); // Set the current user in state if needed elsewhere

        try {
            setIsLoading(true);
            const response = await fetch(
                "http://192.168.0.30:5000/get-all-users",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                }
            );
            const data = await response.json();

            const allUsers = data.users.filter(user => user.email !== decodedToken.email);
            setUsers(allUsers);
        } catch (err) {
            console.log(err, "Kunde inte hämta användarna");
        } finally {
            setIsLoading(false);
        }
    }


    const deleteUser = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            setIsLoading(true)
            const response = await fetch("http://192.168.0.30:5000/delete-user", {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'  // Make sure to include the content type header
                },
                body: JSON.stringify({ email: selectedUser.email })  // Send the email in the body as JSON
            })

            if (response.ok) {
                console.log("Användare har tagits bort");
                setUsers(users.filter(user => user.email !== selectedUser.email));
                setIsDeleteModalOpen(false);
            } else {
                console.error("Något gick fel när du försökte ta bort användaren.");
            }

            
        } catch (err) {
            console.error("Kunde inte ta bort användare", err)
        } finally {
            setIsLoading(false)
        }
    }

    const getExercises = async () => {
        const token = localStorage.getItem("token");    
        if (!token) return
        if (token) {
          try {
            setIsLoading(true)
            const response = await fetch(
              "http://192.168.0.30:5000/get-exercises",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            const data = await response.json();
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

      const deleteExercise = async (exerciseId) => {
        const token = localStorage.getItem("token");
        if (!token) return;
    
        try {
            setIsLoading(true);
            const response = await fetch(`http://192.168.0.30:5000/delete-exercise/${exerciseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.ok) {
                console.log("Exercise deleted successfully");
                setExerciseArray(prevExercises => prevExercises.filter(exercise => exercise._id !== exerciseId));
                setIsDeleteExerciseModalOpen(false)
            } else {
                console.error("Failed to delete exercise");
            }
        } catch (error) {
            console.error("Error deleting exercise:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    

    useEffect(() => {
        getUsers();
        getExercises()
    }, []);

    const toggleExpand = (category) => {
        setExpandedCategory((prevCategory) =>
          prevCategory === category ? null : category,
        );
      };
    

    return (
        <div>
            {isLoading && <Loader />}
            <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef} />
            <AdminButton/>
            <div id="modal-root">
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
          >
            <div className="modal-wrapper">
              <div className="modal-header">
                <h2>Är du säker på att du vill ta bort {selectedUser.name}? Detta går inte att ångra. </h2>
              </div>

              <div className="modal-buttons">
                <button className="modal-button" onClick={closeDeleteModal}>
                  Stäng
                </button>
                <button
                  className="modal-delete-button"
                   onClick={deleteUser} 
                >
                  Ta bort
                </button>
              </div>
            </div>
          </Modal>
        </div>


        <div id="modal-root">
          <Modal
            isOpen={isDeleteExerciseModalOpen}
            onClose={closeDeleteExerciseModal}
          >
            <div className="modal-wrapper">
              <div className="modal-header">
                <h2>Är du säker på att du vill ta bort {selectedExercise.name}? Detta går inte att ångra. </h2>
              </div>

              <div className="modal-buttons">
                <button className="modal-button" onClick={closeDeleteExerciseModal}>
                  Stäng
                </button>
                <button
                  className="modal-delete-button"
                   onClick={() => deleteExercise(selectedExercise._id)} 
                >
                  Ta bort
                </button>
              </div>
            </div>
          </Modal>
        </div>



        <div className="home-wrapper">
                <div className="view-header">
                    <h1>Dashboard</h1>
                </div>


                <div className="dashboard-wrapper">
                    <div className="athlete-container">
                        <h2 className='header-text'>Dina atleter</h2>
                        {users.map((user, index) => (
                            <div className="athlete-item" key={index}>
                                <p>{user.name} {user.lastname}, {user.email}</p>
                                <FontAwesomeIcon className="delete-icon" icon={faTrash} onClick={ () =>openDeleteModal(user)} />
                            </div>
                        ))}
                    </div>


                    <div className="dashboard-exercises">
                    <h2 className='header-text'>Dina övningar</h2>
                    <div className="expand-wrapper">
              {exerciseCategories.map((category) => (
                <div key={category}>
                  <div
                    className="expand"
                    onClick={() => toggleExpand(category)}
                  >
                    <h3 id="category-header">{category}</h3>
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
                            key={exercise._id}
                            className={!exercise.isModule ? "exercise-button" : "module-button"}
                            onClick={ () => openDeleteExerciseModal(exercise)}
                            
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
            </div>

                </div>

                <Footer />
            </div>
        </div>
    );
}
