import {React, useEffect, useState, useContext,useRef} from 'react'
import { useLocation                                                  } from 'react-router-dom'
import Header from '../components/Header';
import Menu from '../components/Menu';
import MenuContext from '../context/MenuContext';
import Loader from '../components/Loader';
import AdminButton from '../components/AdminButton';
import "../styles/userProfile.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMountain, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';





export default function UserProfile() {
    const [isLoading, setIsLoading] = useState(false)
    const location = useLocation();
    const user = location.state.user; 
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    console.log("user from searchprofile", user)
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

        </div>
    <div className="card-container">
                <div className="profile-name-container">
                  <h3>{user.name} {user.lastname}</h3>
                  <p id="title">Hacker</p>
            
                    <div className="description-area">
                    <p>{user.profile?.bio || "Användaren har inte lagt till någon biografi"}</p>
                    </div>
                </div>

                    <div className="picture-container">
                        
                            {user.profileImage ? (
                                <>
                            <img className="profile-pic" src={user.profileImage} alt="profile-pic" />
                                     </>
                            ):(
                                <div className="default-pic">
                                    <span id="head"></span>
                                    <span id="body"></span>
                                </div>
                            )}
                     
                            <div className="instagram-wrapper">
                                {user.profile?.instagram ? (
                                    <a href={`https://instagram.com/${user.profile?.instagram}`} target="_blank" rel="noopener noreferrer">
                                        <FontAwesomeIcon className="instagram-logo" alt="instagram" icon={faInstagram} />
                                        <p>&nbsp;@{user.profile?.instagram}</p>
                                    </a>
                                ) : (
                                    <>
                                        <FontAwesomeIcon className="instagram-logo" alt="instagram" icon={faInstagram} />
                                        <p>&nbsp;@ingeninstagram</p>
                                    </>
                                )}
                            </div>

                    </div>
                </div>
    </div>

    </div>
  )
}
