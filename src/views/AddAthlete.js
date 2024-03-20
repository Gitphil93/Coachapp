import React, { useState, useRef, useContext } from 'react';
import "../styles/addAthlete.css"
import Header from "../components/Header.js"
import Menu from "../components/Menu.js"
import MenuContext from '../context/MenuContext.js'
import Success from "../components/Success.js"

export default function AddAthlete() {
    const [name, setName] = useState("");
    const [key, setKey] = useState("")
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [showNotification, setShowNotification] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isAdded, setIsAdded] = useState(true)
    const hamburgerRef = useRef(null); 
 const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);

    const handleChange = (event, setter) => {
        setter(event.target.value);
    };


    const registerAthlete = async () => {

        if(name.length === 0 || lastName.length === 0 || email.length === 0 || key.length === 0) {
            setShowWarning(true)
            return false

        }
        
        try {
            const response = await fetch("http://localhost:5000/admin/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name:name,
                    lastname:lastName,
                    email:email,
                    key: key,
                    role: 1000,
                    coach: "Yannick"
                })
            })
            console.log(response)
            

            if (response.ok){
                setShowNotification(true)
                setTimeout(() => setShowNotification(false), 500);
                setShowWarning(false)
                setName("")
                setLastName("")
                setEmail("")
                setKey("")
                setIsAdded(true)
                console.log("Användare skapad")

            } else if (!response.ok) {
                setIsAdded(false)
               setTimeout(() => setIsAdded(true), 3000)
            }
        }
        catch (err) {
            console.log(err, "Något gick fel")
        }
    }



    const generateKey = () => {
        let newKey = ""
        const digitsArr = [
            ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), // Stora bokstäver (A-Z)
            ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)), // Små bokstäver (a-z)
            ...Array.from({ length: 10 }, (_, i) => String(i)), // Siffror (0-9)
          ];

          for (let i = 0; i < 10; i++){
            newKey += digitsArr[Math.floor(Math.random() * digitsArr.length)];
          }

          if(key.length === 0){
            setKey(newKey)
          }
          
    }

    return (

      <div>
                    <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} /> 
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef} />
        <div className="home-wrapper" style={{ filter: isMenuOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>



            <h1 className="view-header">Lägg till atlet</h1>
            <div className='input-wrapper'>
                <div className="input-name">
                    <label htmlFor="name">Namn</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Namn"
                        value={name}
                        onChange={(e) => handleChange(e, setName)} 
                    />
                </div>
                <div className="input-name">
                    <label htmlFor="lastname">Efternamn</label>
                    <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        placeholder="Efternamn"
                        value={lastName}
                        onChange={(e) => handleChange(e, setLastName)}
                    />
                </div>
                <div className="input-name">
                    <label htmlFor="email">Mailadress</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => handleChange(e, setEmail)}
                    />
                </div>
                <div className="generate">
                    <button className="generate-key-button" onClick={generateKey}>Generera nyckel</button>
                    { key.length !== 0 &&
                        <div className="key">
                            <h2>{key}</h2>
                        </div>
                    }
                </div>
                <div className="save-button-wrapper">
                    <button className="save-button" onClick={registerAthlete}>Spara atlet</button>
                </div>
            </div>

            {showNotification && 
         <div className="notification">
                <Success></Success>
                </div>
            }

            {showWarning && 
                <div className="notification">
                     <h1 id="warning-notification">Fyll i alla fält och generera en nyckel innan du sparar</h1>
                </div>
            }

            {!isAdded && 
                <div className="notification">
                     <h1 id="warning-notification">Användaren är redan tillagd</h1>
                </div>
                 }

        </div>
        </div>
    );
}
