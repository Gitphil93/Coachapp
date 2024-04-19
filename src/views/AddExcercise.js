import React, { useState, useRef, useContext, useEffect } from "react";
import "../styles/addExcercise.css";
import Success from "../components/Success";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuContext from "../context/MenuContext";
import {jwtDecode} from "jwt-decode"

export default function AddExcercise() {
  const [nameValue, setNameValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isAdded, setIsAdded] = useState(true);
  const hamburgerRef = useRef(null);
  const [user, setUser] = useState({})
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  console.log(user)
  
  const handleNameChange = (event) => {
    setNameValue(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescriptionValue(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryValue(event.target.value);
  };

  useEffect(() => {
    const token = localStorage.getItem("token")
    const decodedToken = jwtDecode(token)
    setUser(decodedToken)
  }, [])

  const addExcercise = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    if (nameValue === "" || categoryValue === "") {
      return false;
    }
    try {
      const response = await fetch("http://192.168.0.30:5000/add-excercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nameValue.trim().charAt(0).toUpperCase() + nameValue.trim().slice(1),
          description: descriptionValue.trim().charAt(0).toUpperCase() + descriptionValue.trim().slice(1),
          category: categoryValue,
        }),
      });

      if (response.ok) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 500);
        setShowWarning(false);
        setIsAdded(true);
        console.log("Övning tillagd");
      } else if (!response.ok) {
        setIsAdded(false);
        setTimeout(() => setIsAdded(true), 3000);
      }

      console.log(response);
    } catch (err) {
      console.log(err, "Något gick fel");
    }
  };

  return (
    <div>
      <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
      <Menu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        hamburgerRef={hamburgerRef}
      />

      <div
        className="home-wrapper"
        style={{
          filter: isMenuOpen
            ? "blur(4px) brightness(40%)"
            : "blur(0) brightness(100%)",
        }}
      >
         <div className="view-header">
        <h1>Skapa övning</h1>
        </div>


        <div className="input-wrapper">
          <div className="input-name">
            <label for="name">Namn</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Raka marklyft"
              value={nameValue}
              onChange={handleNameChange}
            />
          </div>

          <div className="textarea-description">
            <label for="description">Beskrivning</label>
            <textarea
              name="description"
              rows="10"
              placeholder="Raka ben med långsamma och kontrollerade rörelser"
              value={descriptionValue}
              onChange={handleDescriptionChange}
            />
          </div>
        </div>

        <div className="select-category">
          <select
            id="category"
            name="category"
            value={categoryValue}
            onChange={handleCategoryChange}
          >
            <option value="">Välj kategori</option>
            <option value="Styrka">Styrka</option>
            <option value="Kondition">Kondition</option>
            <option value="Hoppträning">Hoppträning</option>
            <option value="Löpning">Löpning</option>
            <option value="Uppvärmning">Uppvärmning</option>

            {user.name === "Yannick" ?  (
            <option value="Uppvärmning">Bös</option>
            ) : 
            <option value="Uppvärmning">Övrigt</option>
             }
          </select>
        </div>

        {showNotification && (
          <div className="notification">
            <Success></Success>
          </div>
        )}

        {showWarning && (
          <div className="notification">
            <h1 id="warning-notification">Fyll i alla fält innan du sparar</h1>
          </div>
        )}

        {!isAdded && (
          <div className="notification">
            <h1 id="warning-notification">Övningen är redan tillagd</h1>
          </div>
        )}

        <div className="save-button-wrapper">
          <button className="save-button" onClick={addExcercise}>
            Spara övning
          </button>
        </div>
      </div>
    </div>
  );
}
