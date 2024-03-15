import React from 'react'
import { Link } from 'react-router-dom'
import "../styles/Header.css"


export default function Header({onMenuToggle, hamburgerRef}) {

  return (
    <div className="header">
      <Link to="/">
        <div className="runner">
            <img src="./runner-logo.svg" id="runner-logo" alt="runner-logo"/>
        </div>
        </Link>

        <div className="hamburger" ref={hamburgerRef} onClick={onMenuToggle}>
            <img src="./hamburger.svg" id="hamburger-logo" alt="hamburger-logo"/>
        </div>
    </div>
  )
}
