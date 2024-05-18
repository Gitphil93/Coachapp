import React, { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import "../styles/coachRegister.css";
import LoaderSpinner from "../components/LoaderSpinner";
import Loader from "../components/Loader";

export default function CoachRegister() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordRepeatValue, setPasswordRepeatValue] = useState("");
  const [nameValue, setNameValue] =useState("")
  const [lastnameValue, setLastnameValue] = useState("")

  const handleChange = (event, setter) => {
    setter(event.target.value);
  };

  const triggerCheckout = async (email) => {
    try {
      const response = await fetch("http://192.168.0.30:5000/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      window.location.href = data.url; // Redirect to Stripe
      //navigate(data.url)
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
    }
  };

  const register = async () => {
    setIsLoading(true)
  
    if (passwordValue === passwordRepeatValue || nameValue !== "" || lastnameValue !== "" || emailValue !== "") {
      try {
        const response = await fetch("http://192.168.0.30:5000/coach/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: nameValue.trim().charAt(0).toUpperCase() + nameValue.trim().slice(1).toLowerCase(),
            lastname: lastnameValue.trim().charAt(0).toUpperCase() + lastnameValue.trim().slice(1).toLowerCase(),
            email: emailValue.toLowerCase(),
            role: 1999,
            password: passwordValue,
          }),
        });
      

        if (response.ok) {
            console.log("användare skapad")
            triggerCheckout(emailValue)
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
          <h1>Testa gratis</h1>
        </div>

        <div className="input-wrapper">
        <div className="input-login-form">
            <input
              type="text"
              placeholder="Förnamn"
              value={nameValue}
              onChange={(e) => handleChange(e, setNameValue)}
            ></input>
          </div>

          <div className="input-login-form">
            <input
              type="text"
              placeholder="Efternamn"
              value={lastnameValue}
              onChange={(e) => handleChange(e, setLastnameValue)}
            ></input>
          </div>

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
        </div>

        <Link to="/login" className="register-text">
          <div>
            <p id="register-paragraph">Har du redan ett konto? Logga in här</p>
          </div>
        </Link>
        <div className="button-wrapper">
          <button
            type="submit"
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
