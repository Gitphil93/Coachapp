import {React, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import "../styles/landingPage.css"

export default function LandingPage() {
    const navigate = useNavigate()
    console.log(document.scrollTop)

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
            <source src="/start-video3.mp4" type="video/mp4"/>
          </video>
          </div>

        <div className="overlay-content">
          <div className="appleet-header">
          <h1>appleet</h1>
          <div className="landing-buttons">
            <button className="landing-button" onClick={login}>Logga in</button>
            <button className="landing-button">Skapa konto</button>
          </div>

          <div className="try-for-free-container">
          <button id="try-for-free-button">Prova gratis i 30 dagar</button>
        </div>

          </div>

 
          <div className="hook-container1">
        <h2>Skapa skräddarsydda träningsprogram som är anpassade efter dig och dina atleters behov</h2>
        </div>

        <div className="hook-container2">
        <h2>Nå dina träningsdata var som helst, när som helst</h2>
        </div>

          <div className="row-wrapper">
            <div className="row-item">
              <h3 className="row-item-h3">REGISTRERA</h3>
              <p className="row-item-p">Skapa konto på några sekunder</p>
            </div>

            <div className="row-item">
              <h3 className="row-item-h3">PLANERA</h3>
              <p className="row-item-p">Lägg till atleter, övningar och skapa träningspass</p>
            </div>

            <div className="row-item">
              <h3 className="row-item-h3">ANALYSERA</h3>
              <p className="row-item-p">Följ framsteg och jämför tidigare resultat</p>
            </div>

          </div>



        </div>



        </div>
    </div>
  )
}
