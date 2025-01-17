import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import LoginForm from "./Pages/LoginForm";
import SignupForm from "./Pages/signupForm";  
import Navbar from "./components/Navbar/navbar";
import SidePanel from "./components/HomePage/slidePanel"
import Keyword from "./components/KeywordOverview/Keywords"



const AppContent = () => {
  const location = useLocation();
  const showSidePanel = !["/login", "/signup"].includes(location.pathname);

  return (
    <div className="app flex h-screen">
      {showSidePanel && <SidePanel />}
      <div className="content-container flex-grow justify-center items-center">
        <Routes>
          <Route path="/" element={<Keyword />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
         </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
      <AppContent />
    </Router>
  );
}


export default App;
