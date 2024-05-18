import {React, useContext} from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";
import SearchProfile from "./SearchProfile";
import MenuContext from "../context/MenuContext";

export default function Header({ onMenuToggle, hamburgerRef }) {
  const location = useLocation();
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  console.log(isMenuOpen)
  const handleLogoClick = () => {
    if (location.pathname !== "/home") {
      window.location.href = "/home";
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="header">
      <Link to="/home" onClick={handleLogoClick}>
        <div className="runner">
        <h1>appleet.</h1>
        </div>
      </Link>


      <SearchProfile />

      <div className="hamburger" ref={hamburgerRef} onClick={onMenuToggle}> 
        <div className={`top-bar ${isMenuOpen ? "expanded" : ""}`}></div>
        <div className={`middle-bar ${isMenuOpen ? "expanded" : ""}`}></div>
        <div className={`bottom-bar ${isMenuOpen ? "expanded" : ""}`}></div>

      </div>
    </div>
  );
}
