import React, { useState } from "react";
import KeDesc from "./keDesc";
import KeInfo from "./keInfo";
import { IoSearchOutline } from "react-icons/io5";
import "../keywordExplorer/keywordExp.css";
import GoogleAds from "../Googleads/AdsFirst";

const keywordExp = () => {
  const [selectedTab, setSelectedTab] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [keyword, setKeyword] = useState("");

  const handleFindKeyword = () => {
    if (keyword.trim() === "") return;
    setShowPopup(true);
  };

  return (
    <>
      <div className="container mx-auto p-4 w-full h-screen bg-[#edf3e8] relative flex flex-col items-center">
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
                  selectedTab === tab ? "text-[#5cacd4]" : "text-gray-500"
                } mx-2`}
              >
                {tab}
              </h1>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center my-4 w-full ">
            <input
              type="text"
              placeholder="Enter your keyword"
              className="bg-slate-100 p-2 border-1 lg:w-[100%] border-orange-500 h-12 w-full sm:w-1/2 rounded-l"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select className="w-full sm:w-1/3 lg:w-40 p-2 bg-slate-100 border-1 border-slate-400 h-12 rounded-r lg:border-l-2 sm:border-1-2 ">
              <option value="">Select Country</option>
              <option value="us">United States</option>
              <option value="ca">Canada</option>
              <option value="uk">United Kingdom</option>
              <option value="au">Australia</option>
              <option value="de">Germany</option>
              <option value="fr">France</option>
              <option value="in">India</option>
              <option value="jp">Japan</option>
              <option value="cn">China</option>
              <option value="br">Brazil</option>
            </select>
            <span className="bg"></span>
          <span className="bg2"></span>
            <button
              className="w-12 h-12 mx-1 p-3 bg-[#5cacd4] rounded-md border-none text-white border-2 flex items-center justify-center hover:bg-[#2671b8]"
              onClick={handleFindKeyword}
            >
              <IoSearchOutline className="text-2xl" />
            </button>
          </div>
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-lg font-bold">Keyword Results</h2>
                <p>Your keyword results will be displayed here.</p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="mt-4 p-2 bg-slate-900 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        <GoogleAds />
      </div>
      <KeInfo />
      <KeDesc />
    </>
  );
};
export default keywordExp;
