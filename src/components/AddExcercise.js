import React, {useState, useEffect} from 'react'
import "./styles/addExcercise.css"
import Success from "./Success"

export default function AddExcercise( {isOpen} ) {
    const [inputValue, setInputValue] = useState("");
    const [exerciseDescriptionValue, setExerciseDescription] = useState("");
    const [exerciseArray, setExerciseArray] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [isNewExerciseAdded, setIsNewExerciseAdded] = useState(false);
  
    const handleChange = (event) => {
      const { name, value } = event.target;
      if (name === 'name') {
        setInputValue(value);
      } else if (name === 'description') {
        setExerciseDescription(value);
      }
    };
  
    const saveExercise = () => {
        if (inputValue.trim() !== '' && exerciseDescriptionValue.trim() !== '') {
            const newExercise = { name: inputValue, description: exerciseDescriptionValue };
            setExerciseArray(prevExerciseArray => [...prevExerciseArray, newExercise]);
            setInputValue("");
            setExerciseDescription("");
        }
    };

    useEffect(() => {
        if (exerciseArray.length > 0) {
            setIsNewExerciseAdded(true);
            console.log(exerciseArray)
        }
    }, [exerciseArray]);

    useEffect(() => {
        if (isNewExerciseAdded) {
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 500);
            setIsNewExerciseAdded(false); // Återställ isNewExerciseAdded till false efter att ha visat notisen
        }
    }, [isNewExerciseAdded]);

  return (
    <div className="home-wrapper" style={{ filter: isOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>
        <h1 className="view-header">Lägg till övning</h1>

        <div className="input-wrapper">
            <div className="input-name">
            <label for="name">Namn</label>
            <input
            type="text"
            id="name"
            name="name"
            placeholder="Raka marklyft"
            value={inputValue}
            onChange={handleChange}
          />
            </div>

        <div className="textarea-description">
            <label for="description">Beskrivning</label>
            <textarea
            name="description"
            rows="10"
            placeholder="Raka ben med långsamma och kontrollerade rörelser"
            value={exerciseDescriptionValue}
            onChange={handleChange}
          />
        </div>
         </div>

         {showNotification && 
         <div className="notification">
                <Success></Success>
                </div>
            }

        <div className="save-button-wrapper">
            <button className="save-button" onClick={saveExercise}>Spara övning</button>
        </div>
    </div>
  )
}
