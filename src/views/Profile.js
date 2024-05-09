import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Profile.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import MenuContext from '../context/MenuContext';
import Loader from '../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faGear, faTrophy, faMountain, faPlus } from '@fortawesome/free-solid-svg-icons';
import AdminButton from '../components/AdminButton';
import Modal from '../components/Modal';
import DateInput from '../components/DateInput';


export default function Profile() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const [image, setImage] = useState(""); 
    const [event, setEvent] = useState("")
    const [pb, setPb] = useState(0)
    const [pbDate, setPbDate] = useState("")
    const [user, setUser] = useState({})
    const [unit, setUnit] =useState("")
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [bio, setBio] = useState("asd asd asd asd asd asd asd asd asd asd aasd asd asd asd asd asd asd asd asd asd a");
    const [imageUrl, setImageUrl] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZBRWavH_xKSiGgujWbvZOFI0lSClOPgX6M9f5sKj95w&s'); 
    const [profileItems, setProfileItems] = useState([
      { id: 1, title: "Dina PB", details: [{ event: "100m", performance: "10.23", date: "2024-01-02", unit:"s", outside: true }, { event: "Längdhopp", performance: "7.35", date: "2024-01-02", unit:"m", outside: true }, { event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true },{ event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true }] },
      { id: 2, title: "Dina SB", details: [{ event: "200m", performance: "20.56", date: "2024-01-02", unit:"s", outside: true }, { event: "Höjdhopp", performance: "2.05", date: "2024-01-02", unit:"m", outside: true }] },
      { id: 3, title: "Tävlingar", details: "Competition Details" },
      { id: 4, title: "Resultat", details: "Results Details" },
      { id: 5, title: "Statistik", details: "Statistics Details" },
    ]);
      console.log(imageUrl)
    const [statistics, setStatistics] = useState([
      {
          personalBests: [
              { event: "Höjdhopp", score: 2.00, date: "2023-10-27", unit: "m" },
              { event: "Längdhopp", score: 5.60, date: "2023-10-27", unit: "m" }
          ],
          seasonBest: { event: "Höjdhopp", score: 1.89, date: "2024-04-01", unit: "m" }
      }
  ]);


    const handleChanges = (event, setter) => {
      setter(event.target.value)
    }
    const toggleExpand = (itemId) => {
      setExpandedItemId(prevItemId => prevItemId === itemId ? null : itemId);
  };

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
          setUser(data.user)
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
                    <select id="unit"
                    onChange={(e) => handleChanges(e, setUnit)}>
                    <option value="">Välj enhet</option>
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                      <option value="s">sekunder</option>
                      <option value="min">minuter</option>
                      <option value="kg">kg</option>
                    </select>
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
                        <textarea rows="5" value={bio} onChange={(e) => setBio(e.target.value)} className="description-area"></textarea>
                    </div>
                    <div className="picture-container">
                        <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg, image/heic, image/jpg" onChange={handleImageChange} style={{ display: 'none' }} />
                        <label htmlFor="avatar">
                            <img className="profile-pic" src={imageUrl} alt="profile-pic" />
                        </label>
                    </div>
                </div>
                <div className="upcoming-container">
                    <h3><span className="upcoming-icon"><FontAwesomeIcon icon={faTrophy} /></span>Nästa tävling</h3>
                    <h3><span className="upcoming-icon"><FontAwesomeIcon icon={faMountain} /></span>Nästa läger</h3>
                </div>

                <div className="content-container">
                                      
                {profileItems.map(item => (
                 <div className={`profile-item ${expandedItemId === item.id ? "expanded" : ""}`} key={item.id} onClick={() => toggleExpand(item.id)}>    

                   <h3>{item.title}</h3>


                   {item.title !== "Tävlingar" && item.title !== "Resultat" && item.title !== "Statistik" && (
                    <div className={`details-container ${expandedItemId === item.id ? "expanded" : ""}`} >
                      {expandedItemId === item.id && item.details.map((detail, index) => (
                        <div className="detail" key={index}>
                            <p className="bold-paragraph">{detail.event}: </p>
                            <p>{detail.performance}{detail.unit}</p>
                            <p>{formatDate(detail.date)}</p>
                            {detail.outside ? <p>Utomhus</p> : <p>Inomhus</p>}
                            </div>
                        ))}

                        
                    </div>
                    )}
                                       {expandedItemId === item.id &&
                            <div id="add-icon-span" onClick={(e) => openModal(e, expandedItemId)}>
                            <FontAwesomeIcon id="add-icon" icon={faPlus} />
                            </div>
                          }

                 </div>
             ))}

              
                </div>
                <Footer/>
            </div>
        </div>
    );
}
