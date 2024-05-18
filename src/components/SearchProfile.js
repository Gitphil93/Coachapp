import {React, useState, useEffect, useContext} from 'react'
import { useNavigate } from 'react-router-dom';
import MenuContext from "../context/MenuContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import "../styles/searchProfile.css"
import LoaderSpinner from "./LoaderSpinner"

export default function SearchProfile() {

    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [toggleSearch, setToggleSearch] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [users, setUsers] = useState([])
    const [isFindingUser, setIsFindingUser] = useState(false)
    const { toggleMenu, isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
    console.log(MenuContext)

    const search = () => {
        setToggleSearch(!toggleSearch)
    }

    const handleInputChange = (e) => {
        setSearchValue(e.target.value)
    }

    useEffect(() => {
      if (isMenuOpen) {
        setToggleSearch(false)
      }
    }, [isMenuOpen])

    useEffect(() => {
        if(searchValue !== "" || users.length === 0) {
            setIsLoading(true)
        }

        const fetchUsers = async () => {
            const token = localStorage.getItem("token")
          if (searchValue.trim() && token) {

            try {
                setIsLoading(true)
              const response = await fetch(`https://appleet-backend.vercel.app/search-users?search=${searchValue}`, {
                headers: {
                  'Authorization': `Bearer ${token}`, 
                  'Content-Type': 'application/json'
                }
              });
              const data = await response.json();
              if (response.ok) {
                  if (data.users === []) {
                      setIsFindingUser(false)
                  }
                setUsers(data.users);
              } else {
                setUsers([]);
                console.error('Failed to fetch users:', data.message);
              }
            } catch (error) {
              console.error('Failed to fetch users:', error);
              setUsers([]);
            } finally {
                setIsLoading(false)
            }
          } 
        };
      
        const delayDebounce = setTimeout(() => {
          fetchUsers();
        }, 1000); 
      
        return () => clearTimeout(delayDebounce); 
      
      }, [searchValue])

      const visitUser = (user) => {
        navigate(`/user-profile/${user._id}`, { state: { user } });  
        setToggleSearch(false)
        setSearchValue("")
    };

    const stopPropagation = (e) => {
      e.stopPropagation()
    }

      
  return (
    <div>      
         <div className="search-profile">
            <FontAwesomeIcon id="search" icon={faMagnifyingGlass} onClick={search}/>
         </div>


         <div className={`search-overlay ${toggleSearch ? "open" : ""}`} onClick={search}>
            <div className={`search-container ${toggleSearch ? "expanded" : ""}`} onClick={(e) => stopPropagation(e)}>
                
                <div className={`search-input ${toggleSearch ? "expanded" : ""}`}>
                    <input type="text" placeholder='Sök användare...' value={searchValue} onChange={(e) => handleInputChange(e)} autoFocus/>
                </div>

                <div className="search-results">
                            {users.length > 0 && !isLoading && searchValue !== "" && 
                                users.map((user, index) => (
                                <div className="search-result-item" key={index} onClick={() => visitUser(user)}>
                                    {user.thumbnailImage ? (
                                    <img className="search-result-avatar" src={user.thumbnailImage} alt="thumbnail"/>
                                    ) :                                   
                                     <span className="initials-wrapper">
                                    <h3 id="initials">{user.name[0]}{user.lastname[0]}</h3>
                                    </span> }

                                    <p>{user.name} {user.lastname}</p>

                                      {user.profile?.title ? (
                                      <span>
                                    <p>{user.profile.title}</p>
                                    </span>
                                    ) : (
                                      <span>
                                    <p>{user.role === 2000 ? "Coach" : "Atlet"}</p>
                                    </span>
                                    )}
                                </div>
                                ))
                                    }

                                    {isLoading && searchValue !== "" &&
                                    <div className='search-result-loader'>
                                     <LoaderSpinner/>
                                    </div>
                                    }

                                    {isFindingUser &&
                                <div className="no-results">
                                <p>Inga resultat hittades</p>
                                </div>
                                }
                            </div>



                
            </div>
        </div>
</div>
  )
}
