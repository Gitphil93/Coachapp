import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";


export default function Header({ onMenuToggle, hamburgerRef }) {
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      window.location.href = "/";
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="header">
      <Link to="/" onClick={handleLogoClick}>
        <div className="runner">
        <h1>appleet.</h1>
        </div>
      </Link>

      <div className="hamburger" ref={hamburgerRef} onClick={onMenuToggle}>

        <img src="./hamburger.svg" id="hamburger-logo" alt="hamburger-logo" />
      </div>
    </div>
  );
}
