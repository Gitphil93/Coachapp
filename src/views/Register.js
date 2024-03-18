import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import "../styles/Register.css"

export default function Register() {
    const [nameValue, setNameValue] = useState("")
    const [lastNameValue, setLastNameValue] = useState("")
    const [emailValue, setEmailValue] = useState("")
    const [passwordValue, setPasswordValue] = useState("")
    const [passwordRepeatValue, setPasswordRepeatValue] = useState("")
    const [keyValue, setKeyValue] = useState("")

    const handleChange = (event, setter) => {
        setter(event.target.value)
    }

    const register = async () => {
        console.log("hej")
        if (passwordValue === passwordRepeatValue) {
            try {
                const response = await fetch("http://localhost:5000/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name:nameValue,
                        lastname:lastNameValue,
                        email:emailValue,
                        password: passwordValue,
                        key: keyValue
                    })
                })
                console.log(response)
                const data = response.status

                if (data === 201){
                    console.log("Användare skapad")
                }
            }
            catch (err) {
                console.log(err, "Något gick fel")
            }
        } else {
            console.log("Lösenorden matchade ej")
        }
    } 
    
  return (
    <div className="register-wrapper">
        <div className="form-wrapper-register">
        <div className="login-header">
            <h1>Registrera dig</h1>
        </div>
   

        <div className="input-wrapper">
            <div className="input-name">
                <input type="text" placeholder='Namn' value={nameValue} onChange={((e) => handleChange(e, setNameValue))}></input>
            </div>
            <div className="input-name">
                <input type="text" placeholder='Efternamn' value={lastNameValue} onChange={((e) => handleChange(e, setLastNameValue))}></input>
            </div>
            <div className="input-name">
                <input type="email" placeholder='Email' value={emailValue} onChange={((e) => handleChange(e, setEmailValue))}></input>
            </div>
            <div className="input-name">
                <input type="password" placeholder='Lösenord' value={passwordValue} onChange={((e) => handleChange(e, setPasswordValue))}></input>
            </div>
            <div className="input-name">
                <input type="password" placeholder='Upprepa lösenord' value={passwordRepeatValue} onChange={((e) => handleChange(e, setPasswordRepeatValue))}></input>
            </div>
            <div className="input-name">
                <input type="text" placeholder="Nyckel" value={keyValue} onChange={((e) => handleChange(e, setKeyValue))}></input>
            </div>
            </div>
            
            <Link to="/login" className="register-text">
        <div>
          <p id="register-paragraph">Har du redan ett konto? Logga in här</p>
        </div>
      </Link>
            <div className="button-wrapper">
        <button className="register-button" id="login-button" onClick={register}>Registrera</button>
      </div>
            </div>

        
    </div>
  )
}
