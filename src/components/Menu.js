import React, { useEffect, useRef, useContext, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Menu.css";
import MenuContext from "../context/MenuContext.js";
import {jwtDecode} from "jwt-decode"

export default function Menu({ hamburgerRef }) {
  const { isMenuOpen, toggleMenu } = useContext(MenuContext);
  const menuRef = useRef(null);
  const [role, setRole] = useState(0)

  const closeMenu = () => {
    toggleMenu();
  };
  
  useEffect(() => { 
      const token = localStorage.getItem("token")
      const decodedToken = jwtDecode(token)
      setRole(decodedToken.role)
      if (!token) return
}, [])


  const handleLogout = () => {
    localStorage.removeItem("token");
    closeMenu();
  };

  
  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (menuRef.current === event.target) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, [isMenuOpen]);

  return (

    <div className={`overlay ${isMenuOpen ? "open" : ""}`} ref={menuRef}>
    <div className={`menu-wrapper ${isMenuOpen ? "open" : ""}`} ref={menuRef}>


      <Link to="/profile" className="menu-item" onClick={closeMenu}>
        <h2 className="menu-item-h2">Min profil</h2>
      </Link>


      <Link to="/my-sessions" className="menu-item" onClick={closeMenu}>
        <h2 className="menu-item-h2">Mina pass</h2>
      </Link>

      <div className="menu-item">
        <h2 className="menu-item-h2">Mina tävlingar</h2>
      </div>

      <Link to="/timer" className="menu-item" onClick={closeMenu}>
        <div>
          <h2 className="menu-item-h2">Timer</h2>
        </div>
      </Link>

      <Link to="/settings" className="menu-item" onClick={closeMenu}>
        <div>
          <h2 className="menu-item-h2">Inställningar</h2>
        </div>
      </Link>


          {role >= 1999 &&
      <Link to="https://billing.stripe.com/p/login/test_14k29FeDs7Ys50ccMM" target="_blank" rel="noopener noreferrer" className="menu-item" onClick={closeMenu}>
        <div>
          <h2 className="menu-item-h2">Min prenumeration</h2>
        </div>
      </Link>
    }

      <Link to="/login" className="menu-item" id="logout" onClick={handleLogout}>
        <div>
          <h4>Logga ut</h4>
        </div>
      </Link>
    </div>
    </div>
  );
}
