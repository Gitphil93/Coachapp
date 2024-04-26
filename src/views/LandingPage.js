import {React, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import "../styles/landingPage.css"

export default function LandingPage() {
    const navigate = useNavigate()
    useEffect(() => {
/*         const token = localStorage.getItem("token")
        if (token) navigate("/home") */
    }, [])

    const login = () => {
      navigate("/login")
    }
  return (
    <div>
        <div className="landing-wrapper">

        <div className="video-container">
        <video width="100%" height="100%" autoPlay playsInline muted loop>
            <source src="/start-video4.mp4" type="video/mp4"/>
          </video>
          </div>

        <div className="overlay-content">
          <div className="appleet-header">
          <h1 className="appleet-header-h1">appleet</h1>
          <div className="landing-buttons">
            <button id="login" className="landing-button" onClick={login}>Logga in</button>
            <button  id="signup" className="landing-button">Skapa konto</button>
          </div>

        <div>
          <h2>Läs mer</h2>
        </div>

          </div>

        </div>

        <div className="overlay-content">
          <div className="page-two-container">
        <div className="hook-container1">
        <h2>REGISTRERA. PLANERA. ANALYSERA.</h2>
        </div>

        <div className="hook-container1">
          <p>Med Appleet kan du enkelt skapa ett konto och bjuda in dina atleter för att effektivt planera och analysera deras träning. Skapa skräddarsydda övningar, följ deras framsteg i realtid och jämför resultat för att optimera deras prestation.
         </p>
        </div>

        <div className="try-for-free-container">
          <form action="http://localhost:5000/create-checkout-session" method="POST">
            <input type="hidden" name="priceId" value="price_G0FvDp6vZvdwRZ" />
          <button type="submit" id="try-for-free-button">Prova gratis i 30 dagar</button>
          </form>
        </div>


          </div>


          
        </div>



        </div>
    </div>
  )
}
