import {React, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import "../styles/stripeSuccess.css"
import { Fireworks } from '@fireworks-js/react'
import { FireworksHandlers } from '@fireworks-js/react'




export default function StripeSuccess() {
  const navigate = useNavigate()
    const ref = useRef(null)

    const toggle = () => {
      if (!ref.current) return
      if (ref.current.isRunning) {
        ref.current.stop()
      } else {
        ref.current.start()
      }
    }

    const login = () => {
      navigate("/login")
    }
  

  return (

    <div>
                    <div className="video-container">
        <video width="100%" height="100%" autoPlay playsInline muted loop>
            <source src="/start-video4.mp4" type="video/mp4"/>
          </video>
          </div>

          <div className="overlay-content">
            <div className="success-wrapper">
    <div className="logo-header-success-page">
        <h1 id="welcome">Tack för att du använder Appleet!</h1>
        </div>

        <div>
        <button className="login-success-page" onClick={login}>Logga in</button>
        </div>

        <div className="fireworks-container" style={{ display: 'flex', gap: '4px', position: 'absolute', zIndex: -2 }}>
        <Fireworks
        ref={ref}
        options={{ 
          acceleration: 1.02,
          opacity: 0.1,
           intensity: 25,
           particles: 100,
           friction: 0.88,
           gravity: 0.0,
           traceSpeed: 5,
           brightness: {
            min: 15,
            max: 50
          },
          lineWidth: { 
          explosion: { min: 1, max: 3 },
          trace: { min: 0.05, max:0.5,},
          delay: {min: 15, max:30}
            },
         rocketsPoint: {
            min: 0,
             max: 100,
      }  }}
        style={{
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          position: 'fixed',
          background: 'transparent',
        }}
      /> 
      </div>



        </div>
   </div>
  </div>
  );
}
