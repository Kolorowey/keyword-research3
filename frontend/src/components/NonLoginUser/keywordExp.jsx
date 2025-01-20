import React, { useState } from "react";
import KeDesc from "./keDesc";
import KeInfo from "./keInfo";

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
      <div className="container mx-auto  w-full h-screen bg-[#edf3e8] relative flex flex-col items-center min-w-[320px]">
        <div className="mt-32">
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
                    ? "text-[#64b100] font-bold transition-all"
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
                      className="bg-[#abd37c] p-3 rounded-r-md ml-[-40px] "
                      onClick={handleFindKeyword}
                    >
                      <i className="fa-solid fa-magnifying-glass text-white"></i>
                    </button>
                  </div>
                </div>
                <div className="flex space-x-4 items-center justify-center">
                  <select className="p-3 border-1 border-[#9cb78b]   rounded-lg focus:outline-none h-[3.4rem] text-[#abd37c]">
                    <option className="flex justify-center items-center">
                      Select Country
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code.toUpperCase()} - {country.name}
                      </option>
                    ))}
                  </select>

                  <select className="p-3 border-1 border-[#9cb78b]   rounded-lg focus:outline-none h-[3.4rem] text-[#abd37c]">
                    <option>Select Language</option>
                    {/* Add language options here */}
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
    </div>
  );
};
export default keywordExp;
