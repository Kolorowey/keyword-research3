import React, { useState } from "react";
import KeDesc from "./keDesc";
import KeInfo from "./keInfo";
import icon1 from '../../assets/img1.png';
import icon2 from '../../assets/img2.png';
import icon3 from '../../assets/img3.png';
import icon4 from '../../assets/img4.png';
import icon5 from '../../assets/img5.png';
import icon6 from '../../assets/img6.png';
import icon7 from '../../assets/img7.png';
import icon8 from '../../assets/img8.png';
import Footer from "../Footer/Footer";
 

import "./keywordExp.css";
import GoogleAds from "../Googleads/AdsFirst";

const countries = [
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "uk", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "in", name: "India" },
  { code: "jp", name: "Japan" },
  { code: "cn", name: "China" },
  { code: "br", name: "Brazil" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "hi", name: "Hindi" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
];

const icons = [
  icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8,
  icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8,
];

const iconPositions = [
  { top: '10%', left: '10%' },
  { top: '20%', left: '20%' },
  { top: '38%', left: '26%' },
  { top: '42%', left: '14%' },
  { top: '70%', left: '50%' },
  { top: '70%', left: '60%' },
  { top: '70%', left: '70%' },
  { top: '80%', left: '80%' },
  { top: '10%', right: '10%' },
  { top: '20%', right: '20%' },
  { top: '30%', right: '30%' },
  { top: '40%', right: '10%' },
  { top: '50%', right: '25%' },
  { top: '70%', right: '60%' },
  { top: '70%', right: '70%' },
  { top: '80%', right: '80%' },
];

const keywordExp = () => {


  
  const [selectedTab, setSelectedTab] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [keywordResults, setKeywordResults] = useState("");

  const handleFindKeyword = () => {
    if (keyword.trim() === "") return;
    setKeywordResults(keyword);
    setShowPopup(true);
  };

  return (
    <div>
      <div
        className="container mx-auto w-full h-screen bg-[#edf3e8] relative flex flex-col items-center min-w-[320px]"
      >
        {icons.map((icon, index) => (
          <img
            key={index}
            src={icon}
            alt={`icon${index + 1}`}
            className="absolute w-12 h-12"
            style={{ ...iconPositions[index], filter: 'invert(1)  ' }} // Change color here
          />
        ))}
        <div className="container-main mt-32">
          <h1 className="text-center text-5xl md:text-4xl font-bold text-gray-700">
            Free Keyword Generator
          </h1>
          <h4 className="text-center text-gray-500 mt-4">
            Find thousands of keywords here
          </h4>{" "}
          <div className="flex text-gray-700 text-2xl flex-wrap justify-center my-6 leading-[3rem]">
            {["Google", "Bing", "Yahoo", "YouTube"].map((tab) => (
              <h1
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`cursor-pointer ${
                  selectedTab === tab
                    ? "text-[#8bc63f] font-bold transition-all"
                    : "text-gray-500 "
                } mx-2`}
              >
                {tab}
              </h1>
            ))}
          </div>
          <div>
            <div className="  flex items-center justify-center h-full">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div>
                    <input
                      type="text"
                      className="w-96 p-3 border-2 border-[#abd37c] rounded-md focus:outline-none"
                      placeholder="Enter your keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button
                      className="bg-[#8bc63f] p-3 rounded-r-md ml-[-40px] hover:bg-[#8bc63f]"
                      onClick={handleFindKeyword}
                    >
                      <i className="fa-solid fa-magnifying-glass text-white"></i>
                    </button>
                  </div>
                </div>
                <div className="flex space-x-4 items-center justify-center">
                  <select className="p-3 border-1 border-[#9cb78b]   rounded-lg focus:outline-none   text-[#82ab53]">
                    <option className="flex justify-center items-center">
                      Select Country
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code.toUpperCase()} - {country.name}
                      </option>
                    ))}
                  </select>

                  <select className="p-3 border-1 border-[#9cb78b]   rounded-lg focus:outline-none   text-[#8dbe57]">
                    <option>Select Language</option>
                    {languages.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.code.toUpperCase()} - {language.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-lg font-bold text-[#8193a6]">
                  Keyword Results
                </h2>
                <p>
                  Your keyword results for "{keywordResults}" will be displayed
                  here.
                </p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="mt-4 p-2 bg-[#0074b1] text-white rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>{" "}
      <GoogleAds />
      <KeInfo className="mt-[44rem]" />
      <KeDesc />
      <Footer/>
    </div>
  );
};
export default keywordExp;
