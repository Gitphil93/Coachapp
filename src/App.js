import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"
import Home from "./views/Home";
import AddExercise from "./views/AddExercise";
import AddAthlete from "./views/AddAthlete";
import Timer from "./views/Timer";
import Login from "./views/Login";
import Register from "./views/Register";
import AddSession from "./views/AddSession";
import { MenuProvider } from "./context/MenuContext.js";
import MySessions from "./views/MySessions";
import MyProfile from "./views/MyProfile";
import CheckToken from "./components/CheckToken";
import LandingPage from "./views/LandingPage"
import AdminDashboard from "./views/AdminDashboard"
import StripeCancel from "./views/StripeCancel";
import StripeSuccess from "./views/StripeSuccess";
import CoachRegister from "./views/CoachRegister";
import UserProfile from "./views/UserProfile";

function App() {

  return (
    <div className="App">
      <MenuProvider>
        <Router>
          <CheckToken />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="home" element={<Home />} />
            <Route path="add-exercise" element={<AddExercise />} />
            <Route path="add-athlete" element={<AddAthlete />} />
            <Route path="add-session" element={<AddSession />} />
            <Route path="admin-dashboard" element={<AdminDashboard />} />
            <Route path="my-sessions" element={<MySessions />} />
            <Route path="timer" element={<Timer />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="coach/register" element={<CoachRegister />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="user-profile/:userId" element={<UserProfile />} />
            <Route path="success" element={<StripeSuccess />} />
            <Route path="cancel" element={<StripeCancel />} />
          </Routes>
        </Router>
      </MenuProvider>
    </div>
  );
}

export default App;
