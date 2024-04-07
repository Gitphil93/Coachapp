import React, { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const navigate = useNavigate();

  const handleChange = (event, setter) => {
    setter(event.target.value);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

  const login = async () => {
    try {
      const response = await fetch("https://appleet.vercel.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailValue,
          password: passwordValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // lagrar token i localstorage för att lätt kunna hämta det
        navigate("/");
      }

    } catch (err) {
      console.log(err, "Något gick fel");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="logo-header">
        <h1>appleet.</h1>
        </div>
      <div className="form-wrapper">
  
        <div className="login-header">
          <h1>Logga in</h1>
        </div>

        <div className="input-wrapper" id="login-input">
          <div className="input-name">
            <input
              type="email"
              placeholder="Email"
              value={emailValue}
              onChange={(e) => handleChange(e, setEmailValue)}
            ></input>
          </div>
          <div className="input-name">
            <input
              type="password"
              placeholder="Lösenord"
              value={passwordValue}
              onChange={(e) => handleChange(e, setPasswordValue)}
            ></input>
          </div>
        </div>

        <Link to="/register" className="register-text">
          <div>
            <p id="register-paragraph">Registrera dig här</p>
          </div>
        </Link>

        <div className="button-wrapper">
          <button className="login-button" id="login-button" onClick={login}>
            Logga in
          </button>
        </div>
      </div>
    </div>
  );
}
