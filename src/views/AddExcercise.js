import React, { useState, useRef, useContext, useEffect } from "react";
import "../styles/addExcercise.css";
import Success from "../components/Success";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import MenuContext from "../context/MenuContext";
import {jwtDecode} from "jwt-decode"
import AdminButton from "../components/AdminButton";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';


export default function AddExcercise() {
  const [isLoading, setIsLoading] = useState(false)
  const [nameValue, setNameValue] = useState("");
  const [moduleNameValue, setModuleNameValue] = useState("")
  const [descriptionValue, setDescriptionValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [moduleCategoryValue, setModuleCategoryValue] = useState("")
  const [showNotification, setShowNotification] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isAdded, setIsAdded] = useState(true);
  const hamburgerRef = useRef(null);
  const [user, setUser] = useState({})
  const [exerciseArray, setExerciseArray] = useState([])
  const [exerciseCategories, setExerciseCategories] = useState([])
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState("")
  const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const [moduleExercises, setModuleExercises] = useState([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryValue, setNewCategoryValue] = useState("")

console.log(categoryValue)
  
  const handleNameChange = (event) => {
    setNameValue(event.target.value);
  };
  const handleModuleNameChange = (event) => {
    setModuleNameValue(event.target.value);
  };


  const handleCategoryValue = (e) => {
 setNewCategoryValue(e.target.value)
  }

  const handleDescriptionChange = (event) => {
    setDescriptionValue(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryValue(event.target.value);
  };

  const handleModuleCategoryChange = (event) => {
    setModuleCategoryValue(event.target.value)
  }


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
      const response = await fetch("https://appleet-backend.vercel.app/add-exercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nameValue.trim().charAt(0).toUpperCase() + nameValue.trim().slice(1),
          description: descriptionValue.trim().charAt(0).toUpperCase() + descriptionValue.trim().slice(1),
          category: categoryValue,
          coach: user.email
        }),
      });

      if (response.ok) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 500);
        setShowWarning(false);
        setIsAdded(true);
        console.log("Övning tillagd");
        getExercises()
      } else if (!response.ok) {
        setIsAdded(false);
        setTimeout(() => setIsAdded(true), 3000);
      }

      console.log(response);
    } catch (err) {
      console.log(err, "Något gick fel");
    }
  };

  const addExerciseToModule = (exercise) => {
    // Kontrollera först om övningen redan finns i modulen
    if (!moduleExercises.some(e => e._id === exercise._id)) {
        setModuleExercises(prevExercises => [...prevExercises, exercise]);

        // Samtidigt, ta bort övningen från exerciseArray
        setExerciseArray(prevExercises => prevExercises.filter(e => e._id !== exercise._id));
    } else {
        console.log('Övningen finns redan i modulen');
    }
}

const removeExerciseFromModule = (exerciseId) => {
  const exerciseToReAdd = moduleExercises.find(e => e._id === exerciseId);
  if (exerciseToReAdd) {
      // Lägger tillbaka övningen till listan över tillgängliga övningar
      setExerciseArray(prevExercises => [...prevExercises, exerciseToReAdd]);
  }

  // Uppdaterar modulövningarna genom att filtrera bort den valda övningen
  setModuleExercises(prevExercises => prevExercises.filter(e => e._id !== exerciseId));
}


  const getExercises = async () => {
    const token = localStorage.getItem("token");    
    if (!token) return
    if (token) {
      try {
        setIsLoading(true)
        const response = await fetch(
          "https://appleet-backend.vercel.app/get-exercises",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if(response.ok){
        console.log(data);
        setExerciseArray(data);
        const categories = Array.from(
          new Set(data.map((exercise) => exercise.category)),
        );
        setExerciseCategories(categories);
      }
      } catch (err) {
        console.log(err, "Kunde inte hämta övningarna");
      } finally {
           setIsLoading(false) 
      }
    }
  }

  const deleteExercise = async (exerciseId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        setIsLoading(true);
        const response = await fetch(`https://appleet-backend.vercel.app/delete-exercise/${exerciseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log("Exercise deleted successfully");
            setExerciseArray(prevExercises => prevExercises.filter(exercise => exercise._id !== exerciseId));
        } else {
            console.error("Failed to delete exercise");
        }
    } catch (error) {
        console.error("Error deleting exercise:", error);
    } finally {
        setIsLoading(false);
    }
};

const postModule = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch("https://appleet-backend.vercel.app/add-exercise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: moduleNameValue.trim().charAt(0).toUpperCase() + moduleNameValue.trim().slice(1),
        category: moduleCategoryValue,
        exercises: moduleExercises,
        coach: user.email,
        isModule: true,
      }),
    });

    if (response.ok) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 500);
      setShowWarning(false);
      setIsAdded(true);
      setModuleExercises([])
      console.log("Modul sparad");
    } else {
      setIsAdded(false);
      setTimeout(() => setIsAdded(true), 3000);
    }
  } catch (err) {
    console.log(err, "Något gick fel");
  }
};

const toggleExpand = (category) => {
  setExpandedCategory((prevCategory) =>
    prevCategory === category ? null : category,
  );
};


const toggleNewCategory = () => {
  setShowNewCategory(prevState => !prevState);
}

const addCategory = () => {
  const lowerCaseNewCategory = newCategoryValue.toLowerCase();
  
  if (exerciseCategories.some(category => category.toLowerCase() === lowerCaseNewCategory)) {
    console.log("Kategori finns redan")
    return;
  }

  setExerciseCategories(prevCategories => [...prevCategories, newCategoryValue]);
  setCategoryValue(newCategoryValue);
  setShowNewCategory(false);
  setNewCategoryValue("")
};

useEffect(() => {
    getExercises()
}, []);

  return (
    <div>
      <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
      <Menu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        hamburgerRef={hamburgerRef}
      />
      <AdminButton/>


      <div className="home-wrapper">
         <div className="view-header">
        <h1>Skapa övning</h1>
        </div>


        <div className="input-wrapper">
          <div>
            <label for="name">Namn</label>
            <input
            className="input-name"
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
              rows="4"
              placeholder="Raka ben med långsamma och kontrollerade rörelser"
              value={descriptionValue}
              onChange={handleDescriptionChange}
            />
          </div>
        </div>


     
        <div className="select-category">
        <span id="add-category">
          <p>Kategori</p>
             <FontAwesomeIcon id="plus-icon" onClick={toggleNewCategory} icon={faCirclePlus}/>
          </span>

          {exerciseCategories.length > 0 && 
          <select
            id="category"
            name="category"
            value={categoryValue}
            onChange={handleCategoryChange}
          >

            <option value="">Välj kategori</option>
            {exerciseCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
            }


        </div>

          {showNewCategory && 
        <div className="new-category">
          <input placeholder="T.ex. Styrka" value={newCategoryValue} onChange={handleCategoryValue} className="input-name"/>
          <FontAwesomeIcon id="plus-icon" onClick={addCategory} icon={faCirclePlus} />
        </div>
      }


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
        

        <div className="expand-container">
        <div className="view-header">
          <h1>Skapa modul</h1>
        </div>

          <div className="expand-wrapper">
              {exerciseCategories.map((category) => (
                <div key={category}>
                  <div
                    className="expand"
                    onClick={() => toggleExpand(category)}
                  >
                    <h3 id="category-header">{category}</h3>
                    <img
                      id="arrow"
                      src="/arrow.png"
                      alt="arrow-icon"
                      style={{
                        transform:
                          expandedCategory === category
                            ? "rotate(90deg)"
                            : "rotate(-90deg)",
                      }}
                    />
                  </div>

                  <div
                    className={
                      expandedCategory === category
                        ? "expanded-content expanded"
                        : "expanded-content"
                    }
                  >
                    {exerciseArray.map((exercise) => {
                      if (exercise.category === category) {
                        return (
                          <button
                            key={exercise._id}
                            className="exercise-button"
                            onClick={ () => addExerciseToModule(exercise)}
                            
                          >
                            {exercise.name}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>

  
              <label for="name">Vad vill du kalla din modul?</label>
              <input name="name" value={moduleNameValue} onChange={handleModuleNameChange} placeholder="T.ex. Uppvärmingsmodul 1" id="name" className="input-name" />
              <div className="select-module-category">
                <label for="category">I vilken kategori vill du lägga till modulen?</label>
                <select
                  id="category"
                  name="category"
                  value={moduleCategoryValue}
                  onChange={handleModuleCategoryChange}
                >
                  <option value="">Välj kategori</option>
                  {exerciseCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

        </div>
    

                      <div className="module-container">
              {moduleExercises.length > 0 ? (
                    <div className="selected-module-exercises">
                      {moduleExercises.map((exercise) => (
                          <button className="exercise-button" key={exercise._id} onClick={(e) => removeExerciseFromModule(exercise._id)}>
                              {exercise.name}
                          </button>
                      ))}
                  </div>
              ) : (
                  <p>Inga övningar har lagts till i modulen än.</p>
              )}
          </div>
          <div className="save-button-wrapper">
            <button className="save-button" onClick={postModule}>Spara Modul</button>
            </div>
            </div>
            <Footer></Footer>
      </div>

    </div>
  );
}
