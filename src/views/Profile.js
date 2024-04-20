import React from 'react'
import "../styles/Profile.css"
import {useState, useEffect, useContext,useRef} from "react"
import Header from '../components/Header'
import Footer from '../components/Footer'
import Menu from '../components/Menu'
import MenuContext from '../context/MenuContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faGear, faTrophy,faMountain} from '@fortawesome/free-solid-svg-icons';


export default function Profile() {
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    const hamburgerRef = useRef(null);
    const [image, setImage] = useState(); // Stores the file object
    const [imageUrl, setImageUrl] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZBRWavH_xKSiGgujWbvZOFI0lSClOPgX6M9f5sKj95w&s'); 

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
  },[])
    
/*     const uploadImage = async () => {
      const formData = new FormData();
      formData.append('avatar', image); // Assuming 'avatar' is the field expected by the server
  
      try {
          const response = await fetch('YOUR_ENDPOINT_URL', {
              method: 'POST',
              body: formData,
          });
  
          if (!response.ok) throw new Error('Upload failed');
          const result = await response.json();
          console.log('Uploaded successfully:', result);
      } catch (error) {
          console.error('Error uploading image:', error);
      }
  }; */

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.substr(0, 5) === "image") {
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

        <div className="top-header">
          <FontAwesomeIcon id="gear" icon={faGear} />
        </div>

        <div className="card-container">

          <div className="profile-name-container">
            <h3>Philip Jansson</h3>
            <p id="title">Hacker</p>
            <p id="desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum molestie vulputate viverra. Mauris et tristique sapien, id faucibus magna</p>

          </div>


          <div className="picture-container">
          <img className="profile-pic" src={imageUrl} alt="profile-pic"/>

          </div>


        </div>
        
        <div className="upcoming-container">
          <h3><span className="upcoming-icon"><FontAwesomeIcon icon={faTrophy} /></span>Nästa tävling</h3>
          <h3><span className="upcoming-icon"><FontAwesomeIcon icon={faMountain} /></span>Nästa läger</h3>
        </div>
{/*  
        <div>
          <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg, image/jpg" onChange={handleImageChange} />
          </div>  */}

          <div className="content-container">
            <div className="profile-item">
              <h3>PERSONBÄSTA</h3>
              <span className="profile-icon">
              <FontAwesomeIcon icon={faPen} />
              </span>
              </div>

              <div className="profile-item">
              <h3>SÄSONGSBÄSTA</h3>
              <span className="profile-icon">
              <FontAwesomeIcon icon={faPen} />
              </span>
              </div>

              <div className="profile-item">
              <h3>TÄVLINGAR</h3>
              <span className="profile-icon">
              <FontAwesomeIcon icon={faPen} />
              </span>
              </div>

              <div className="profile-item">
              <h3>RESULTAT</h3>
              <span className="profile-icon">
              <FontAwesomeIcon icon={faPen} />
              </span>
              </div>

              <div className="profile-item">
              <h3>STATISTIK</h3>
              <span className="profile-icon">
              <FontAwesomeIcon icon={faPen} />
              </span>
              </div>
          </div>




          <Footer/>
      </div>
    
    </div>
  )
}
