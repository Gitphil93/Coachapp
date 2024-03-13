import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import Header from "./components/Header";
import Home from "./components/Home";
import Menu from "./components/Menu";
import AddExcercise from './components/AddExcercise';
import AddAthlete from './components/AddAthlete';
import Timer from './components/Timer';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hamburgerRef = useRef(null); 


  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };

 
  return (
    <div className="App">
      <Router>
      <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} /> 
      <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} hamburgerRef={hamburgerRef} />
      <Routes>
      <Route path="/" element={<Home isOpen={isMenuOpen}/>}/>
      <Route path="add-excercise" element={<AddExcercise isOpen={isMenuOpen}/>} />
      <Route path="add-athlete" element={<AddAthlete isOpen={isMenuOpen}/>} />
      <Route path="timer" element={<Timer isOpen={isMenuOpen}/>} />

      </Routes>
      </Router>
    </div>
  );
}

export default App;
