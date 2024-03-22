import React, {useRef, useEffect, useState, useContext} from 'react'
import "../styles/Home.css"
import Header from "../components/Header.js"
import Menu from "../components/Menu.js"
import MenuContext from '../context/MenuContext.js'


export default function Home() {

  const hamburgerRef = useRef(null); 
  const [name, setName] = useState("")
  const [globalMessage, setGlobalMessage] = useState("Globalt meddelande")
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);

  console.log(isMenuOpen)
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/get-user", {
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
        }
      })
      .catch(error => console.error("Error fetching user:", error));
    }
  }, []);

  let hour = new Date().getHours()
  let greeting = ""
  let sessionObj = {header: "Styrka", day: "Måndag", time: "12:30", where: "Friidrottens Hus"}


  if (hour < 10) {
      greeting = "God morgon";
  } else if (hour >= 10 && hour < 14) {
      greeting = "God middag";
  } else if (hour >= 14 && hour < 18) {
      greeting = "God eftermiddag";
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

      {globalMessage.length != 0 &&

      <div className="global-message">
        <span className="global-message-author">
            <h3>YT</h3>
        </span>

        <span id="skrev">
          <p>:</p>
        </span>

        <span className="global-message-content">
          <p>{globalMessage}</p>
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
      

    </div>
    </div>
  )
}
