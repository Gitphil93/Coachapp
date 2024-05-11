import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Profile.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import MenuContext from '../context/MenuContext';
import Loader from '../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faGear, faTrophy, faMountain, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

import AdminButton from '../components/AdminButton';
import Modal from '../components/Modal';
import DateInput from '../components/DateInput';


export default function Profile() {
      const navigate = useNavigate()
      const [isLoading, setIsLoading] = useState(false)
      const [isModalOpen, setIsModalOpen] = useState(false)
      const [isEditingBio, setIsEditingBio] = useState(false);
      const bioRef = useRef(null);
      const [isEditingInstagram, setIsEditingInstagram] = useState(false);
      const [instagram, setInstagram] = useState('');
      const instagramRef = useRef(null);
      const [addingItemId, setAddingItemId] = useState({})
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const [image, setImage] = useState(""); 
    const [event, setEvent] = useState("")
    const [pb, setPb] = useState(0)
    const [pbDate, setPbDate] = useState("")
    const [user, setUser] = useState({})
    const [unit, setUnit] =useState("")
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [bio, setBio] = useState("");
    const [imageUrl, setImageUrl] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZBRWavH_xKSiGgujWbvZOFI0lSClOPgX6M9f5sKj95w&s'); 
    const [profileItems, setProfileItems] = useState([
      { id: 1, title: "Dina PB", details: [{ event: "100m", performance: "10.23", date: "2024-01-02", unit:"s", outside: true }, { event: "Längdhopp", performance: "7.35", date: "2024-01-02", unit:"m", outside: true }, { event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true }] },
      { id: 2, title: "Dina SB", details: [{ event: "200m", performance: "20.56", date: "2024-01-02", unit:"s", outside: true }, { event: "Höjdhopp", performance: "2.05", date: "2024-01-02", unit:"m", outside: true }] },
      { id: 3, title: "Tävlingar", details: "Competition Details" },
      { id: 4, title: "Resultat", details: "Results Details" },
      { id: 5, title: "Statistik", details: "Statistics Details" },
    ]);

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
    }
  }, [isEditingBio]);

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

const toggleExpand = (itemId) => {
  if (expandedItemId === itemId) {
      setExpandedItemId(null);  // Om samma element klickas igen, stäng det
      setAddingItemId(null);    // Återställ även addingItemId när inget element är expanderat
  } else {
      setExpandedItemId(itemId);  // Öppna det nya elementet
  }
};

const toggleAddItem = (e, itemId) => {
  e.stopPropagation(); // Prevent event bubbling to keep the item expanded
  if (addingItemId === itemId) {
      setAddingItemId(null); // Toggle off if it's the same item
  } else {
      setAddingItemId(itemId); // Toggle on new item
  }
}


    const handleChanges = (event, setter) => {
      setter(event.target.value)
    }

    const openModal = (event ,expandedItemId) => {
      event.stopPropagation()
      setIsModalOpen(true)
    }
    const closeModal = () => {
      setIsModalOpen(false)
    }

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
        } else {
          console.log("Kunde inte hämta användare");
        }
      } catch (err) {
        console.error("Något gick fel när användaren hämtades", err);
      }
    }
    
    

    const addPb = (itemId, event) => {
      event.stopPropagation(); // Prevents the event from bubbling up

  
      closeModal()
  };

  const formatDate = (dateString) => {
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
  };
  
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
    

    return (
        <div>
            <Header onMenuToggle={toggleMenu} />
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            <AdminButton/>

            {isLoading &&
            <Loader />
            }

        <div id="modal-root">
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
                  <h2>Lägg till PB</h2>
              </div>

                 <div className="modal-inputs">
                    <div className="modal-top-row">
                   <input className="modal-input" type="text" placeholder="Övning/gren" onChange={(e) => handleChanges(e, setEvent)} />
                   <input className="modal-input" type="number" placeholder="10.23s/1.80m" onChange={(e) => handleChanges(e, setPb)} />

                    </div>
                  
                
                   <input className="modal-input" type="date" name="date" placeholder="YYYY-MM-DD" onChange={(e) => handleChanges(e, setPbDate)} />
                   <div className="modal-radios">
                     <span className="modal-radio">
                   <label for="outside">Utomhus</label>
                   <input  type="radio" id="html" name="outside" value="HTML"/>
                   </span>
                   <span className="modal-radio">
                   <label for="inside">Inomhus</label>
                    <input type="radio" id="html" name="outside" value="HTML"/>
                    </span>
                    </div>


                </div>
                

              <div className="modal-buttons">
                <button className="modal-delete-button" onClick={closeModal}>Stäng</button>
                <button className="modal-button" onClick={addPb}>Lägg till</button>
              </div>
            </div>
          </Modal>
        </div>



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
                                      
                {profileItems.map(item => (
            <div className={`profile-item ${expandedItemId === item.id ? "expanded" : ""}`} key={item.id} onClick={() => toggleExpand(item.id)}>    
                <h3>{item.title}</h3>
                {item.title !== "Tävlingar" && item.title !== "Resultat" && item.title !== "Statistik" && (
                    <div className={`details-container ${expandedItemId === item.id ? "expanded" : ""}`}>
                        {expandedItemId === item.id && item.details.map((detail, index) => (
                            <div className="detail" key={index}>
                                <p className="bold-paragraph">{detail.event}: </p>
                                <p>{`${detail.performance} ${detail.unit}`}</p>
                                <p>{formatDate(detail.date)}</p>
                                <p>{detail.outside ? "Utomhus" : "Inomhus"}</p>
                            </div>
                        ))}
                    {addingItemId === item.id && (
                              <div className="add-result">
                                  <input id="event-input" placeholder="T.ex. höjdhopp" autoFocus />
                                  <input id="result-input" placeholder="1.80"/>
                                  <select id="unit"
                              onChange={(e) => handleChanges(e, setUnit)}>
                              <option value="">T.ex m</option>
                                <option value="m">m</option>
                                <option value="cm">cm</option>
                                <option value="s">sekunder</option>
                                <option value="min">minuter</option>
                                <option value="kg">kg</option>
                              </select>
                              <input type="date"/>
                              <select id="setting-select">
                    {addingItemId === item.id && (
                              <div className="add-result">
                                  <input id="event-input" placeholder="T.ex. höjdhopp" autoFocus />
                                  <input id="result-input" placeholder="1.80"/>
                                  <select id="unit"
                              onChange={(e) => handleChanges(e, setUnit)}>
                              <option value="">T.ex m</option>
                                <option value="m">m</option>
                                <option value="cm">cm</option>
                                <option value="s">sekunder</option>
                                <option value="min">minuter</option>
                                <option value="kg">kg</option>
                              </select>
                              <input type="date"/>
                              <select id="setting-select">
                                <option value="">Inomhus</option>
                                <option value="Inomhus">Inomhus</option>
                                <option value="Utomhus">Utomhus</option>
                              </select>
                              </div>
                )}

                              </select>
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
        ))}

              
                </div>
                <Footer/>
            </div>
        </div>
    );
}
