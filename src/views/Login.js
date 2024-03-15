import React from 'react'
import "../styles/Login.css"

export default function Login() {
  return (
    <div className='login-wrapper'>
      <div className="form-wrapper">
        <div className="login-header">
      <h1>Logga in</h1>
      </div>

      <div className="input-wrapper" id="login-input">
        <div className="input-name" >
          <input type="email" placeholder='Email'></input>
      </div>
      <div className="input-name">
          <input type="password" placeholder='Lösenord'></input>
      </div>
      </div>

      <div className="register-text">
        <p id="register-paragraph">Registrera dig här</p>
      </div>

      <div className="button-wrapper">
        <button className="login-button" id="login-button">Logga in</button>
      </div>


      </div>
      </div>
    
  )
}
