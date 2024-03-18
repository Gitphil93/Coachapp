import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';

import Home from "./views/Home";
import AddExcercise from './views/AddExcercise';
import AddAthlete from './views/AddAthlete';
import Timer from './views/Timer';
import Login from "./views/Login"
import Register from "./views/Register"
import {MenuProvider} from './context/MenuContext.js';

function App() {

  const hamburgerRef = useRef(null); 


 
 
  return (
    <div className="App">
     <MenuProvider>
        <Router>
        <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="add-excercise" element={<AddExcercise />} />
        <Route path="add-athlete" element={<AddAthlete />} />
        <Route path="timer" element={<Timer/>} />
        <Route path="login" element={<Login/>} />
        <Route path="register" element={<Register/>} />
        </Routes>
        </Router>
      </MenuProvider>
    </div>
  );
}

export default App;
