import React, {useContext, useRef, useEffect} from 'react'
import "../styles/addSession.css"
import Header from "../components/Header.js"
import Menu from "../components/Menu.js"
import MenuContext from '../context/MenuContext'

export default function AddSession() {
    const hamburgerRef = useRef(null); 
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);

    useEffect(() => {
        async function getExcercises() {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("http://localhost:5000/get-exercises", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    console.log(data); // Logga ut de hämtade övningarna
                } catch (err) {
                    console.log(err, "Kunde inte hämta övningarna");
                }
            }
        }
        getExcercises();
    }, []);
    
  return (
    <div>
            <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} /> 
<Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef}/>
        <div className="home-wrapper" style={{ filter: isMenuOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>
        <h1 className="view-header">Lägg till pass</h1>

        </div>
    </div>
  )
}
