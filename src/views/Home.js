import React, {useRef, useEffect, useState, useContext} from 'react'
import "../styles/Home.css"
import Header from "../components/Header.js"
import Menu from "../components/Menu.js"
import MenuContext from '../context/MenuContext.js'

export default function Home() {

  const hamburgerRef = useRef(null); 
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  


  let hour = new Date().getHours()
  let name = " Philip"
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
        <h1> {greeting}, {name}!</h1>
      </div>
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
