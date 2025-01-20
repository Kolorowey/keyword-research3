import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import LoginForm from "./Pages/LoginForm";
import SignupForm from "./Pages/signupForm"; // Ensure correct case for import
import Navbar from "./components/Navbar/navbar";
import SidePanel from "./components/HomePage/slidePanel";
import Keyword from "./components/KeywordOverview/Keywords";
import KeywordExp from "./components/NonLoginUser/keywordExp"; // Import the new component

 
const isLoggedIn = () => {
  return localStorage.getItem("userToken") !== null;
};

const PrivateRoute = ({ element }) => {
  return isLoggedIn() ? element : <Navigate to="/login" />;
};

const PublicRoute = ({ element }) => {
  return !isLoggedIn() ? element : <Navigate to="/keyword" />;
};

const AppContent = () => {
  const location = useLocation();
  const showSidePanel = !["/", "/login", "/signup"].includes(location.pathname);

  return (
    <div className="app flex h-screen">
      {showSidePanel && <SidePanel />}

      
      <div className={`content-container flex-grow   `}>
        <Routes>
          {/* <Route path="/" element={isLoggedIn() ? <Navigate to="/keyword" /> : <Navigate to="/keywordExp" />} /> */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          {/* <Route path="/keyword" element={<Keyword />} /> */}
          <Route path="/keyword" element={<PrivateRoute element={<Keyword />} />} /> 
          <Route path="/" element={<KeywordExp />} />  
         
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
