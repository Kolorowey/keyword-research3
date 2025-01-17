import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./Pages/LoginForm";
import SignupForm from "./Pages/signupForm";  
import Navbar from "./components/Navbar/navbar";
import SidePanel from "./components/HomePage/slidePanel"
import Keyword from "./components/KeywordOverview/Keywords"




function App() {
  return (
    <Router>
      <Navbar />
      <div className="app flex h-screen">
        <SidePanel />
        <div className="content-container flex-grow justify-center items-center">
          <Routes>
            <Route path="/keyword" element={<Keyword/>} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/" element={<LoginForm />} /> {/* Default route */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
