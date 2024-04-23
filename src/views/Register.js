import React, { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import "../styles/Register.css";
import LoaderSpinner from "../components/LoaderSpinner";
import Loader from "../components/Loader";

export default function Register() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordRepeatValue, setPasswordRepeatValue] = useState("");
  const [keyValue, setKeyValue] = useState("");

  const handleChange = (event, setter) => {
    setter(event.target.value);
  };

  const register = async () => {
    setIsLoading(true)
  
    if (passwordValue === passwordRepeatValue) {
      try {
        const response = await fetch("http://192.168.0.30:5000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailValue,
            password: passwordValue,
            key: keyValue,
          }),
        });
        const data = response.status;

        if (data === 201) {
          navigate("/login")
          console.log("Användare skapad");
        }
      } catch (err) {
        console.log(err, "Något gick fel");
      } finally {
        setIsLoading(false)
      }
    } else {
      console.log("Lösenorden matchade ej");
    }
  };

  return (
    <div>

<div className="video-container">
        <video width="100%" height="100%" autoPlay playsInline muted loop>
            <source src="/start-video4.mp4" type="video/mp4"/>
          </video>
          </div>

    <div className="register-wrapper">
            <div className="logo-header">
        <h1>appleet.</h1>
        </div>
      <div className="form-wrapper-register">
        <div className="login-header">
          <h1>Registrera dig</h1>
        </div>

        <div className="input-wrapper">
          <div className="input-login-form">
            <input
              type="email"
              placeholder="Email"
              value={emailValue}
              onChange={(e) => handleChange(e, setEmailValue)}
            ></input>
          </div>
          <div className="input-login-form">
            <input
              type="password"
              placeholder="Lösenord"
              value={passwordValue}
              onChange={(e) => handleChange(e, setPasswordValue)}
            ></input>
          </div>
          <div className="input-login-form">
            <input
              type="password"
              placeholder="Upprepa lösenord"
              value={passwordRepeatValue}
              onChange={(e) => handleChange(e, setPasswordRepeatValue)}
            ></input>
          </div>
          <div className="input-login-form">
            <input
              type="text"
              placeholder="Nyckel"
              value={keyValue}
              onChange={(e) => handleChange(e, setKeyValue)}
            ></input>
          </div>
        </div>

        <Link to="/login" className="register-text">
          <div>
            <p id="register-paragraph">Har du redan ett konto? Logga in här</p>
          </div>
        </Link>
        <div className="button-wrapper">
          <button
            className="register-button"
            id="login-button"
            onClick={register}
          >
            {isLoading && <LoaderSpinner/>}
            {!isLoading 
            && "Registrera"}
            
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
