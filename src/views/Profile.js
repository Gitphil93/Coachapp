import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Profile.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import MenuContext from '../context/MenuContext';
import Loader from '../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrophy, faMountain, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import AdminButton from '../components/AdminButton';
import ProfileItems from '../components/ProfileItems';


export default function Profile() {
      const navigate = useNavigate()
      const [isLoading, setIsLoading] = useState(false)
      const [isModalOpen, setIsModalOpen] = useState(false)
      const [isEditingBio, setIsEditingBio] = useState(false);
      const bioRef = useRef(null);
      const [isEditingInstagram, setIsEditingInstagram] = useState(false);
      const [instagram, setInstagram] = useState('');
      const instagramRef = useRef(null);
    /*   const [addingItemId, setAddingItemId] = useState(null) */
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const [image, setImage] = useState(""); 
/*     const [event, setEvent] = useState("")
    const [pb, setPb] = useState(0)
    const [pbWeight, setPbWeight] = useState("")
    const [date, setDate] = useState("")
    const [setting, setSetting] = useState("") */
    const [user, setUser] = useState({})
    const [personalBests, setPersonalBests] = useState([])
    /* const [unit, setUnit] =useState("") */
 /*    const [expandedItemId, setExpandedItemId] = useState(null); */
/*     const [animation, setAnimation] = useState("slideInFromRight") */

    const [bio, setBio] = useState("");
    const [imageUrl, setImageUrl] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZBRWavH_xKSiGgujWbvZOFI0lSClOPgX6M9f5sKj95w&s'); 


    const [statistics, setStatistics] = useState([
      {
          personalBests: [
              { event: "Höjdhopp", score: 2.00, date: "2023-10-27", unit: "m" },
              { event: "Längdhopp", score: 5.60, date: "2023-10-27", unit: "m" }
          ],
          seasonBest: { event: "Höjdhopp", score: 1.89, date: "2024-04-01", unit: "m" }
      }
  ]);


  useEffect(() => {
    if (isEditingBio && bioRef.current) {
      bioRef.current.focus();
      focusAtEnd()
    }
  }, [isEditingBio]);

  const focusAtEnd = () => {
    const textArea = bioRef.current;
    textArea.focus();
    // Set cursor position at the end of text
    textArea.selectionStart = textArea.selectionEnd = textArea.value.length;
};


  const toggleEditBio = () => {
    setIsEditingBio(!isEditingBio);
  };

  const handleBlurBio = () => {
    if (bio !== "Klicka här för att lägga till biografi" && bio.trim() !== "") {
        updateUserProfile({ bio: bio });
    }
    setIsEditingBio(false);
};
  
  useEffect(() => {
    if (isEditingInstagram && instagramRef.current) {
      instagramRef.current.focus();
    }
  }, [isEditingInstagram]);

  const toggleEditInstagram = () => {
    setIsEditingInstagram(!isEditingInstagram);
  };

  const handleInstagramChange = (event) => {
    setInstagram(event.target.value);
  };

const handleBlurInstagram = () => {
    if (instagram !== "Lägg till din instagram" && instagram.trim() !== "") {
        updateUserProfile({ instagram: instagram });
    }
    setIsEditingInstagram(false);
};

/* const toggleExpand = (itemId, e) => {
  e.stopPropagation(); 
  if (!addingItemId && expandedItemId === itemId) {
    setExpandedItemId(null); 
  } else if (!addingItemId) {
    setExpandedItemId(itemId); 
  }
};


const toggleAddItem = (e, itemId) => {
  e.stopPropagation(); 
  if (addingItemId === itemId) {
      setAddingItemId(null); 
      setStep(1)
  } else {
      setAddingItemId(itemId); 
  }
} */


    const handleChanges = (event, setter) => {
      setter(event.target.value)
    }
/* 
    const openModal = (event ,expandedItemId) => {
      event.stopPropagation()
      setIsModalOpen(true)
    }
    const closeModal = () => {
      setIsModalOpen(false)
    } */

    const handleImageChange = async (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image")) {
          setImage(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setImageUrl(reader.result);
              uploadImage(file);  // Lägg till denna rad
          };
          reader.readAsDataURL(file);
      } else {
          setImage(null);
      }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    const token = localStorage.getItem("token")
    try {
        const response = await fetch("http://192.168.0.30:5000/upload-image", {
            method: "POST",
            headers: {
               "Authorization": `Bearer ${token}`,
          },
            body: formData,
        });
        const data = await response.json();
        console.log("Upload successful", data);
    } catch (error) {
        console.error("Error uploading image", error);
    }
};  

    const getUser = async (token) => {
      try {
        const response = await fetch("http://192.168.0.30:5000/get-user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
    
        if (response.ok) {
          const data = await response.json(); // Läser och parsar JSON-svaret
          console.log(data)
          setUser(data.user)
          setBio(data.user.profile?.bio || "Klicka här för att lägga till biografi"); 
          setInstagram(data.user.profile?.instagram || "Lägg till instagram");
          setImageUrl(`${data.user.profileImage}?${new Date().getTime()}`);
          setPersonalBests(data.user.profile?.personalBests)
        } else {
          console.log("Kunde inte hämta användare");
        }
      } catch (err) {
        console.error("Något gick fel när användaren hämtades", err);
      }
    }
    

/*   const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const formattedDate = dateObj.toLocaleDateString('sv-SE', {
      day: '2-digit',
      month: '2-digit',
    });

    const formattedYear = dateObj.getFullYear().toString().slice(2)

    const [month, day, year] = formattedDate.split('/').map(part => parseInt(part, 10));
    const formattedMonth = month < 10 ? month.toString() : month;
    const formattedDay = day < 10 ? day.toString() : day;
  

  
    return `${formattedMonth}/${formattedDay}-${formattedYear}`;
  }; */
  
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
        navigate("/login")
        return 
      }
  
      try {
        setIsLoading(true)
        getUser(token)
      } catch (err){
        console.error("Något gick fel vid hämtning", err)
      } finally {
        setIsLoading(false)
      }
    }, []);

    const updateUserProfile = async (updates) => {
      console.log(updates)
      const token = localStorage.getItem("token"); // Assume token is stored in localStorage
      try {
          const response = await fetch(`http://192.168.0.30:5000/update-user/${user._id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(updates)
          });
  
          const result = await response.json();
          if (response.ok) {
              console.log('Update successful:', result);
              setUser(prev => ({ ...prev, ...updates }));
          } else {
              console.error('Failed to update user profile:', result);
          }
      } catch (error) {
          console.error('Error updating user profile:', error);
      }
  };
  
 /*  const handleNext = () => {
    setAnimation('slideInFromRight');
    setStep(prevStep => prevStep + 1);
  };
  
  const handleBack = () => {
    setAnimation('slideInFromLeft');
    setStep(prevStep => prevStep - 1);
  };
    
  const savePb = async () => {
    const newPb = {
        event,
        performance: pb,
        unit,
        date,
        insideOutside: setting,
        weight: pbWeight
    };

    try {
        const token = localStorage.getItem("token"); 
        const response = await fetch(`http://192.168.0.30:5000/add-pb/${user._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newPb })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Personal best added successfully:', result);
            setEvent("");
            setPb("");
            setUnit("");
            setDate("");
            setSetting("");
            setPbWeight("");
            setIsModalOpen(false);
            setAddingItemId(null)
        } else {
            console.error('Failed to add personal best:', result);
        }
    } catch (error) {
        console.error('Error adding personal best:', error);
    }
}; */


    return (
        <div>
            <Header onMenuToggle={toggleMenu} />
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            <AdminButton/>

            {isLoading &&
            <Loader />
            }

            <div className="home-wrapper">
                <div className="top-header">
                    <FontAwesomeIcon icon={faGear} />
                </div>
                <div className="card-container">
                <div className="profile-name-container">
                  <h3>{user.name} {user.lastname}</h3>
                  <p id="title">Hacker</p>
                  {isEditingBio ? (
                    <div className="description-area">
                      <textarea
                        ref={bioRef}
                        rows="6"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        onClick={focusAtEnd}
                        onBlur={handleBlurBio}
                      />
                    </div>
                  ) : (
                    <div className="description-area">
                    <p onClick={toggleEditBio}>{bio}</p>
                    </div>
                  )}
                </div>

                    <div className="picture-container">
                        <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg, image/heic, image/jpg" onChange={handleImageChange} style={{ display: 'none' }} />
                        <label htmlFor="avatar">
                            <img className="profile-pic" src={imageUrl} alt="profile-pic" />
                        </label>
                        <div className="instagram-wrapper">
                          <FontAwesomeIcon className="instagram-logo" alt="instagram" onClick={toggleEditInstagram} icon={faInstagram} />&nbsp;
                          {isEditingInstagram ? (
                          <input
                              ref={instagramRef}
                              type="text"
                              value={instagram}
                              onChange={handleInstagramChange}
                              onBlur={handleBlurInstagram}
                            />
                                                      ) : (
                            <p onClick={toggleEditInstagram}>&nbsp;@{instagram}</p>
                          )}
                        </div>
                    </div>
                </div>
                <div className="upcoming-container">
                  <div className="upcoming-item">
                    <h3><span className="upcoming-icon"><FontAwesomeIcon icon={faTrophy} /></span>Nästa tävling</h3>
                    </div>
                    <div className="upcoming-item">
                    <h3><span className="upcoming-icon"><FontAwesomeIcon icon={faMountain} /></span>Nästa läger</h3>
                    </div>
                </div>

                <div className="content-container">
                                      <ProfileItems userObj={user}/>
{/*                 {profileItems.map(item => (
            <div className={`profile-item ${expandedItemId === item.id ? "expanded" : ""}`} key={item.id} onClick={(e) => toggleExpand(item.id, e)}>    
                <h3>{item.title}</h3>
                {item.title !== "Tävlingar" && item.title !== "Resultat" && item.title !== "Statistik" && (
                    <div className={`details-container ${expandedItemId === item.id ? "expanded" : ""}`}>
                        {expandedItemId === item.id && item.details.map((detail, index) => (
                            <div className="detail" key={index}>
                                <p className="bold-paragraph">{detail.event}: </p>
                                <p>{`${detail.performance}${detail.unit}`}</p>
                                <p>{formatDate(detail.date)}</p>
                                <p>{detail.outside ? "Utomhus" : "Inomhus"}</p>
                            </div>
                        ))}
                    {addingItemId === item.id && (
                              <div className="add-result-wrapper">

                                 <div className="add-item-header">
                                  <h3>Nytt PB</h3>
                                  <FontAwesomeIcon onClick={toggleAddItem} className="delete-icon" icon={faTrash}></FontAwesomeIcon>
                                  </div>


                              <div className="add-result">
                        
                                {step === 1 && 
                                <div className="step-container">
                                  <div className="step-content" key={step} style={{ animationName: animation }}>
                                  <div className="add-item-inputs">
                                    <span className="item-input">
                                       <label for="event">Gren/övning</label>
                                       <input type="text" id="event-input" name="event" placeholder="T.ex. höjdhopp" onChange={(e) => handleChanges(e, setEvent)}/>
                                   </span>

                                   <span className="item-input">
                                     <label for="result">Fyll i resultat</label>
                                  <input type="number" name="result" id="result-input" placeholder="T.ex. 1.80" onChange={(e) => handleChanges(e, setPb)}/>
                                  </span>

                                  <span className="item-input">
                                    <label for="unit">Välj enhet</label>
                                  <select className="setting-select" id="unit" name="unit" onChange={(e) => handleChanges(e, setUnit)}>
                                      <option value="">m/s/kg</option>
                                      <option value="m">m</option>
                                      <option value="cm">cm</option>
                                      <option value="s">sekunder</option>
                                      <option value="min">minuter</option>
                                      <option value="kg">kg</option>
                                   </select>
                                   </span>
                                   </div>

                              <div className="add-result-button">
                                <button onClick={handleBack}>Tillbaka</button>
                                 <button onClick={handleNext}>Nästa</button>
                                 </div>
                                 </div>
                                 </div>
                             }
                        
                             
                             
                             {step === 2 &&
                             <div className="step-container">
                                <div className="step-content" key={step} style={{ animationName: animation }}>
                                   <div className="add-item-inputs" >
                                  <span className="item-input">
                                    <label for="date">Välj datum</label>
                              <input type="date" name="date" onChange={(e) => handleChanges(e, setDate)} />
                              </span>
                              <span className="item-input">
                                <label for="setting">Ute eller inne?</label>
                              <select className="setting-select" name="setting" onChange={(e) => handleChanges(e, setSetting)}>
                              <option value="">Ute/inne</option>
                                <option value="Utomhus">Utomhus</option>
                                <option value="Inomhus">Inomhus</option>
                                </select>
                                </span>
                                </div>

                                <div className="add-result-button">
                              <button onClick={handleBack}>Tillbaka</button>
                                 <button onClick={handleNext}>Nästa</button>
                                 </div>
                                 </div>
                                 </div>
                                  }
                         
                            
                             {step === 3 &&
                             <div className="step-container">
                               <div className="step-content" key={step} style={{ animationName: animation }}>
                                <div className="add-item-inputs">
                              <span className="item-input">
                                <label for="weight">Vad vägde du vid tillfället?</label>
                                <input type="text" id="pb-weight-input" value={pbWeight} placeholder="Vikt i kg" onChange={(e) => handleChanges(e, setPbWeight)}/>
                                </span>
                                </div>
                                <div className="add-result-button">
                              <button onClick={handleBack}>Tillbaka</button>
                                 <button onClick={savePb}>Spara</button>
                                 </div>
                                 </div>
                                 </div>
                                  }


                                  </div>
                                </div>
                                )}
                            
                           </div>
                     )}

                {expandedItemId === item.id && (
                    <div id="add-icon-span" onClick={(e) => toggleAddItem(e, item.id)}>
                        <FontAwesomeIcon id="add-icon" icon={faPlus} />
                    </div>
                )}

            </div>
        ))} */}

              
                </div>
                <Footer/>
            </div>
        </div>
    );
}
