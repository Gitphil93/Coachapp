import React, { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import LoaderSpinner from "../components/LoaderSpinner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
 import { faEnvelope, faLock} from '@fortawesome/free-solid-svg-icons';


export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const navigate = useNavigate();

  const handleChange = (event, setter) => {
    setter(event.target.value);
  };

  const login = async () => {

    try {
      setIsLoading(true)
      const response = await fetch("https://appleet-backend.vercel.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailValue.toLowerCase(),
          password: passwordValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // lagrar token i localstorage för att lätt kunna hämta det
        navigate("/home");
      }

    } catch (err) {
      console.log(err, "Något gick fel");
    } finally {
      setIsLoading(false)
    }
  };

  return (

    <div>
                    <div className="video-container">
        <video width="100%" height="100%" autoPlay playsInline muted loop>
            <source src="/start-video4.mp4" type="video/mp4"/>
          </video>
          </div>

    <div className="login-wrapper">

      <div className="logo-header">
        <h1>appleet.</h1>
        </div>
      <div className="form-wrapper">
  
        <div className="login-header">
          <h1>Logga in</h1>
        </div>

        <div className="input-wrapper" id="login-input">

          <div className="input-login-form">
            <span className="form-icon">
          <FontAwesomeIcon icon={faEnvelope} />
          </span>
            <input
              type="email"
              placeholder="Email"
              value={emailValue}
              onChange={(e) => handleChange(e, setEmailValue)}
              
            >
            </input>
          </div>
        
          <div className="input-login-form">
            <span className="form-icon">
          <FontAwesomeIcon icon={faLock} />
          </span>
            <input
              type="password"
              placeholder="Lösenord"
              value={passwordValue}
              onChange={(e) => handleChange(e, setPasswordValue)}
            >
            </input>
          </div>
        </div>

        <Link to="/register" className="register-text">
          <div>
            <p id="register-paragraph">Registrera dig här</p>
          </div>
        </Link>

        <div className="button-wrapper">
          <button className="login-button" id="login-button" onClick={login}>
          {isLoading && <LoaderSpinner/>}
          {!isLoading &&  "Logga in" }
           
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
