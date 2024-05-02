import {React, useState, useEffect} from 'react'
import { Link, useNavigate,useLocation } from 'react-router-dom'
import "../styles/adminButton.css"
import Modal from './Modal'
import {jwtDecode} from "jwt-decode"
import Loader from './Loader'

export default function AdminButton() {
    const navigate = useNavigate()
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false)
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [user, setUser] = useState({})
    const [globalMessage, setGlobalMessage] = useState("")
    const [globalMessageInput, setGlobalMessageInput] = useState("")
    const [isGlobalMessageModalOpen, setIsGlobalMessageModalOpen] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const decodedToken = jwtDecode(token)
        setUser(decodedToken)

    
    }, [])

    const openGlobalMessageModal = () => {
        setIsGlobalMessageModalOpen(true)
    }

    const closeGlobalMessageModal = () => {
        setIsGlobalMessageModalOpen(false)
    }

    const handleInputChange = (e) => {
        setGlobalMessageInput(e.target.value)
    }

    const openAdminModal = () => {
        if (user.role > 1999) {
          setIsAdminModalOpen(true);
        }
      };
    
      const closeAdminModal = () => {
        if (user.role >= 1999) {
          setIsAdminModalOpen(false);
        }
      };

      const adminDashboard = () => {
        navigate("/admin-dashboard")
      }

      const message = async (message) => {
          console.log(message)
        setIsAdminModalOpen(false);
    
        if (message === null || message.trim() === "") {
           setGlobalMessage(""); 
           closeGlobalMessageModal()
          return false
        }
        closeGlobalMessageModal()

        setGlobalMessage(message);
        await postMessage(message);

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
                author: user.name.charAt(0) + user.lastname.charAt(0),
                coach: user.name + " " + user.lastname
              }),
            },
          );
    
          if (response.ok) {
          console.log("Globalt meddelnade postat")
          }
    
          console.log(response);
        } catch (err) {
          console.error("Något gick fel vid postning av meddelande", err);
        } finally {
          setIsLoading(false)
         }
        } else {
          navigate("/login")
        }
      };

      const deleteGlobalMessage = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
    
        try {
            setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const fetchGlobalMessage = async () => {
        const token = localStorage.getItem("token")
        const decodedToken = jwtDecode(token)
        const role = decodedToken.role
        try {
          setIsLoading(true);
      
          // Hämta JWT-token från lagring eller var den är tillgänglig
          const token = localStorage.getItem('token'); // Justera detta beroende på var din token lagras
      
          // Lägg till Authorization-header med token
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
            } else if (role === 3000){ // admin hämtar alla meddelanden, alltså i en array
              // Därför tar vi det sista
              setGlobalMessage(data.globalMessage[data.globalMessage.length -1])
            } else {
              setGlobalMessage(data.globalMessage);
            }
          } else {
            console.error("Failed to fetch global message");
          }
      
        } catch (error) {
          console.error("Error fetching global message:", error);
        } finally {
          setIsLoading(false);
        }
      };
    
      
  return (
    <div>

<div id="modal-root">
          <Modal isOpen={isAdminModalOpen} onClose={closeAdminModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
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

        {user.role >= 2000 && location.pathname !== "/home" && (
          <div className="menu-icon">
            <img
              src="./plus-icon.svg"
              alt="plus-icon"
              onClick={openAdminModal}
              className="admin-button"
            />
          </div>
        )}
    </div>
  )
}
