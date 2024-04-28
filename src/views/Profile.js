import React, { useState, useEffect, useContext } from 'react';
import "../styles/Profile.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import MenuContext from '../context/MenuContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faGear, faTrophy, faMountain, faPlus } from '@fortawesome/free-solid-svg-icons';
import AdminButton from '../components/AdminButton';
import Modal from '../components/Modal';


export default function Profile() {
  const [isModalOpen, setIsModalOpen] = useState(false)
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const [image, setImage] = useState(); 
    const [event, setEvent] = useState("")
    const [pb, setPb] = useState(0)
    const [pbDate, setPbDate] = useState("")
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [bio, setBio] = useState("asd asd asd asd asd asd asd asd asd asd a");
    const [imageUrl, setImageUrl] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZBRWavH_xKSiGgujWbvZOFI0lSClOPgX6M9f5sKj95w&s'); 
    const [profileItems, setProfileItems] = useState([
      { id: 1, title: "Dina PB", details: [{ event: "100m", performance: "10.23s" }, { event: "Längdhopp", performance: "7.35m" }] },
      { id: 2, title: "Dina SB", details: [{ event: "200m", performance: "20.56s" }, { event: "Höjdhopp", performance: "2.05m" }] },
      { id: 3, title: "TÄVLINGAR", details: "Competition Details" },
      { id: 4, title: "RESULTAT", details: "Results Details" },
      { id: 5, title: "STATISTIK", details: "Statistics Details" },
    ]);

    const [statistics, setStatistics] = useState([
      {
          personalBests: [
              { event: "Höjdhopp", score: 2.00, date: "2023-10-27", metric: "m" },
              { event: "Längdhopp", score: 5.60, date: "2023-10-27", metric: "m" }
          ],
          seasonBest: { event: "Höjdhopp", score: 1.89, date: "2024-04-01", metric: "m" }
      }
  ]);

    const handleChanges = (event, setter) => {
      setter(event.target.value)
    }
    const toggleExpand = (itemId) => {
        setExpandedItemId(prevItemId => prevItemId === itemId ? null : itemId);
    };

    const openModal = () => {
      setIsModalOpen(true)
    }
    const closeModal = () => {
      setIsModalOpen(false)
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image")) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImage(null);
        }
    };

    const addPb = (itemId, event) => {
      event.stopPropagation(); // Prevents the event from bubbling up
  
      const newDetail = { date: pbDate, event: event, performance: pb }; // New empty detail
  
      setProfileItems(prevItems =>
          prevItems.map(item =>
              item.id === itemId ? {
                  ...item,
                  details: [...item.details, newDetail] // Adds the new detail to the correct item
              } : item
          )
      );
      closeModal()
  };
  
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return;
    }, []);

    return (
        <div>
            <Header onMenuToggle={toggleMenu} />
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            <AdminButton/>


        <div id="modal-root">
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="modal-wrapper">
              <div className="modal-header">
                  <h2>Lägg till PB</h2>
              </div>

                 <div className="modal-content">
                   <input type="text" placeholder="Övning/gren" onChange={(e) => handleChanges(e, setEvent)} />
                   <input type="number" placeholder="10.23s/1.80m" onChange={(e) => handleChanges(e, setPb)} />
                   <input type="date" placeholder="YYYY-MM-DD" onChange={(e) => handleChanges(e, setPbDate)} />
                </div>
                

              <div className="modal-buttons">
                <button className="modal-delete-button" onClick={closeModal}>Stäng</button>
                <button className="modal-button" onClick={addPb}>Lägg till</button>
              </div>
            </div>
          </Modal>
        </div>



            <div className="home-wrapper" style={{ filter: isMenuOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>
                <div className="top-header">
                    <FontAwesomeIcon icon={faGear} />
                </div>
                <div className="card-container">
                    <div className="profile-name-container">
                        <h3>Philip Jansson</h3>
                        <p id="title">Hacker</p>
                        <textarea rows="5" value={bio} onChange={(e) => setBio(e.target.value)} className="description-area"></textarea>
                    </div>
                    <div className="picture-container">
                        <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" onChange={handleImageChange} style={{ display: 'none' }} />
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
                        <div 
                            key={item.id} 
                            className={`profile-item ${expandedItemId === item.id ? "expanded" : ""}`}
                            onClick={() => toggleExpand(item.id)}
                        >    
                            
                            <h3>{item.title}</h3>
                            {expandedItemId === item.id &&
                            <span id="add-icon-span" onClick={(e) => openModal(e, expandedItemId)}>

                            <FontAwesomeIcon id="add-icon" icon={faPlus} />
                            </span>
                          }
                            {expandedItemId === item.id && (
                                <div className="details-container">
                                    {Array.isArray(item.details) ? item.details.map(detail => (
                                        <div key={`${item.id}-${detail.event}`} className="detail">

                                            <p>{detail.event}: </p>
                                            <p>{detail.performance}</p>
                                        
                                        </div>
                                    )) : <p>{item.details}</p>}
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
