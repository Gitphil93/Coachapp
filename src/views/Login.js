import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import "../styles/Login.css"

export default function Login() {
const [usernameValue, setUsernameValue] = useState("")
const [passwordValue, setPasswordValue] = useState("")

 const handleChange = (event, setter) => {
    setter(event.target.value)
 }
  return (
    <div className='login-wrapper'>
      <div className="form-wrapper">
        <div className="login-header">
      <h1>Logga in</h1>
      </div>

      <div className="input-wrapper" id="login-input">
        <div className="input-name" >
          <input type="email" placeholder='Email' value={usernameValue} onChange={(e) => handleChange(e, setUsernameValue)}></input>
      </div>
      <div className="input-name">
          <input type="password" placeholder='Lösenord' value={passwordValue} onChange={(e) => handleChange(e, setPasswordValue)}></input>
      </div>
      </div>

      <Link to="/register" className="register-text">
        <div>
          <p id="register-paragraph">Registrera dig här</p>
        </div>
      </Link>


      <div className="button-wrapper">
        <button className="login-button" id="login-button">Logga in</button>
      </div>


      </div>
      </div>
    
  )
}
