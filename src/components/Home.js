import React from 'react'
import "./styles/Home.css"

export default function Home({isOpen}) {

  let hour = new Date().getHours()
  let name = " Philip"
  let greeting = ""
  let sessionObj = {header: "Styrka", day: "Måndag", time: "12:30", where: "Friidrottens Hus"}


  if (hour < 10) {
      greeting = "God morgon";
  } else if (hour >= 10 && hour < 14) {
      greeting = "God middag";
  } else if (hour >= 14 && hour < 18) {
      greeting = "God eftermiddag";
  } else if (hour >= 18 && hour < 23) {
      greeting = "God kväll";
  }



  return (
    <div className="home-wrapper" style={{ filter: isOpen ? "blur(4px) brightness(40%)" : "blur(0) brightness(100%)" }}>

      <div className="view-header">
        <h1> {greeting}, {name}</h1>
      </div>
      <div className="sessions-header">
       <h3>Dagens pass</h3>
      </div>
      <div className="sessions">
        <div className="sessions-content">
          <h2>{sessionObj.header}</h2>
          <h2>{sessionObj.day} {sessionObj.time}</h2>
          <h2>{sessionObj.where}</h2>
        </div>
      </div>
      

    </div>
  )
}
