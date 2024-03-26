import React, {useRef, useEffect, useState, useContext} from 'react'
import "../styles/Home.css"
import Header from "../components/Header.js"
import Menu from "../components/Menu.js"
import MenuContext from '../context/MenuContext.js'
import Modal from "../components/Modal.js"


export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hamburgerRef = useRef(null); 
  const modalRef = useRef();
  const [name, setName] = useState("")
  const [globalMessage, setGlobalMessage] = useState("")
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const [userRole, setUserRole] = useState(0)
  const [initials, setInitials] = useState("")
console.log(globalMessage)

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://192.168.0.36:5000/get-user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log("data",data)
        if (data.success) {
          setName(data.user.name); 
          setInitials(data.user.name[0] + data.user.lastname[0])
          setUserRole(data.user.role)
        }
      })
      .catch(error => console.error("Error fetching user:", error));
    }
  }, []);

  const message = async () => {
    setIsModalOpen(false);
    const message = prompt("Skriv globalt meddelande");
  
    if (message === null || message.trim() === "") {
      return;
    }
  
    setGlobalMessage(message);
   
    await postMessage(message);
  }

  const postMessage = async (message) => {

    try {
    const response = await fetch("http://192.168.0.36:5000/admin/post-global-message", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
         globalMessage: message,
         author: initials
      })
  })

  if (response.ok) {
    console.log("Meddelande postat")
    fetchGlobalMessage()
  } 

  console.log(response)
    } catch (err) {
      console.error("Något gick fel vid postning av meddelande", err)
    }
  }

  useEffect(() => {
    fetchGlobalMessage();
  }, []);

  const fetchGlobalMessage = async () => {
    try {
      const response = await fetch("http://192.168.0.36:5000/get-global-message");
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        if (data.globalMessage === null) {
          setGlobalMessage(null)
      } else {
        setGlobalMessage(data.globalMessage)
      }
      } else {
        console.error("Failed to fetch global message");
      }
    } catch (error) {
      console.error("Error fetching global message:", error);
    }
  };

  const deleteGlobalMessage = () => {
    setGlobalMessage(null)
    setIsModalOpen(false)
  }

  let hour = new Date().getHours()
  let greeting = ""
  let sessionObj = {header: "Styrka", day: "Måndag", time: "12:30", where: "Friidrottens Hus"}


  if (hour < 10) {
      greeting = "God morgon";
  } else if (hour >= 10 && hour < 14) {
      greeting = "Hej";
  } else if (hour >= 14 && hour < 18) {
      greeting = "Hej";
  } else if (hour >= 18 && hour < 23) {
      greeting = "God kväll";
  }



  return (

    <div>
               <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} /> 
       <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef} />
  
    
    <div className="home-wrapper" style={{ filter: isMenuOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>


      <div className="view-header">
        <h1> {greeting} {name}!</h1>
      </div>

      {globalMessage !== null &&
  <div className="global-message">
    <span className="global-message-author">
      <h3 id="author">{globalMessage.author}</h3>
    </span>

    <span id="skrev">
      <p>:</p>
    </span>

    <span className="global-message-content" onClick={openModal}>
      <p>{globalMessage.globalMessage}</p>
    </span>
  </div>
}


      <div className="sessions-header">
       <h3>Dagens pass</h3>
      </div>
      <div className="sessions">
        <div className="sessions-content">
          <h2>{sessionObj.header}</h2>
          <h2>{sessionObj.day} {sessionObj.time}</h2>
          <h2>{sessionObj.where}</h2>
        </div>
      </div>
      

{userRole > 1000 && (
                    <div className="menu-icon">
                        <img src="./plus-icon.svg" alt="plus-icon" onClick={message} className="admin-button"/>
                    </div>
                )}

<div id="modal-root">
<Modal isOpen={isModalOpen} onClose={closeModal}>
  <div className="modal-wrapper">
    <div className="modal-header">
        <h2>Ändra eller ta bort globalt meddelande</h2>
    </div>

    <div className="modal-buttons">
        <button className="modal-button" onClick={message}>Ändra</button>
        <button className="modal-delete-button" onClick={deleteGlobalMessage}>Ta bort</button>
    </div>
  </div>
      </Modal>
</div>




    </div>
    </div>
  )
}
