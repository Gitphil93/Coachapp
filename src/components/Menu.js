import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'
import "./styles/Menu.css"


export default function Menu( { isOpen, setIsOpen, hamburgerRef}) {
    const menuRef = useRef(null);

    const closeMenu = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutsideMenu = (event) => {
          if (
            menuRef.current &&
            !menuRef.current.contains(event.target) &&
            isOpen &&
            event.target !== hamburgerRef.current &&
            event.target.parentNode !== hamburgerRef.current
          ) {
            setIsOpen(false);
          }
        };
  
      document.addEventListener('mousedown', handleClickOutsideMenu);
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutsideMenu);
      };
    }, [isOpen, setIsOpen, hamburgerRef]);
    
console.log(isOpen)
  return (
    <div className={`menu-wrapper ${isOpen ? "open" : ""}`} ref={menuRef} style={{ transform: isOpen ? 'translateX(0%)' : 'translateX(100%)' }}>
        <div className="menu-item">
            <h2>Skapa pass</h2>
        </div>
        <Link to="add-excercise" className="menu-item" onClick={closeMenu}>
        <div>
            <h2>Lägg till övning</h2>
        </div>
        </Link>

        <Link to="add-athlete" className="menu-item" onClick={closeMenu}>
        <div>
            <h2>Lägg till atlet</h2>
        </div>
        </Link>

        <div className="menu-item">
            <h2>Mina pass</h2>
        </div>

        <div className="menu-item">
            <h2>Tävlingar</h2>
        </div>

        <Link to="timer" className="menu-item" onClick={closeMenu}>
        <div>
            <h2>Timer</h2>
        </div>
        </Link>

        <div className="menu-item" id="logout">
            <h4>Logga ut</h4>
        </div>
        
    </div>
  )
}
