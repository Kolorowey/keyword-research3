import React from "react";
import { useState } from "react";
import data from "../../assets/data.js";
import "@lottiefiles/lottie-player";
import "./keywordExp.css";

const KeInfo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleMouseDown = (index) => {
    setActiveIndex(index);
  };
  return (
    <>
      <div>
        <div className="w-full bg-[#e8e7e7] text-2xl md:text-4xl font-bold p-24 text-black iteam-center leading-[3rem] md:leading-[4rem] bg-cover h-[28rem] text-center">
          <h1 className="text-center ">
            Enhance Your Content
            <br className="block md:hidden" /> with Effective SEO Tools
          </h1>
          <p className="text-center text-sm mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </p>
        </div>
{/* 
        <div className={`w-3/4 mx-auto flex flex-wrap justify-center `}>
          <div
            className={`container w-full mt-6 sm:w-full mx-auto shadow-xl rounded-t-lg grid flex-wrap justify-center bg-[#ffffff] gap-x-20 relative bottom-44  `}
          >
            <div className="icon-row gap-48 flex flex-wrap justify-center items-center p-8 bg-transparent">
              {data.map((item, index) => (
                <button
                  key={index}
                  className={`icon-button text-center flex flex-col items-center transition-transform duration-300 ${
                    activeIndex === index ? "scale-110 text-gray-500" : ""
                  }`}
                  onClick={() => handleMouseDown(index)}
                >
                  <img
                    src={item.Icons}
                    alt={item.title}
                    className={`w-12 h-auto `}
                  />
                  <p className="text-center text-sm">{item.title}</p>
                  <hr className={`absolute border-2 bottom-0 w-full max-w-xs transition-all duration-300 ${
                    activeIndex === 0
                    ? "bg-[#b4acac]"
                    : activeIndex === 1
                    ? "bg-[#bec1b4]"
                    : activeIndex === 2
                    ? "bg-[#97a193]"
                    : "bg-transparent"
                  }`} />
                </button>
              ))}
            </div>
            
             
          </div>
          <div  className={`container w-full  sm:w-full mx-auto h-[30rem] shadow-xl rounded-b-lg grid flex-wrap justify-center bg-[#fdfaf5] gap-x-20 clear-both relative bottom-44 ${
              activeIndex === 0
                ? "bg-[#b4acac]"
                : activeIndex === 1
                ? "bg-[#bec1b4]"
                : activeIndex === 2
                ? "bg-[#97a193]"
                : "bg-transparent"
            }`}>
              
            <hr />
            <div
              className={`content-container mt-6 flex flex-col md:flex-row justify-center items-center gap-10 transition-transform duration-500 ease-in-out transform ${
                activeIndex !== null
                  ? "translate-x-0 opacity-100"
                  : "translate-x-4 opacity-0"
              }`}
            >
              <div
                className={`transition-transform duration-500 ease-in-out transform ${
                  activeIndex !== null
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <h2 className="text-semibold text-4xl mb-3 ">
                  {data[activeIndex].heading}
                </h2>
                <ul className="bullet-points leading-9 ">
                  {data[activeIndex].list.map((point, idx) => (
                    <li className="ml-3 list-disc text-justify" key={idx}>
                      <p>{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <img src={data[activeIndex].image} alt={"randomimage"} />
              </div>
            
            </div>
            <a
              className="mt-6"
              href={data[activeIndex].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="w-[7rem] rounded-lg bg-blue-300 p-4 mb-9">
                {" "}
                Click Here{" "}
              </button>
            </a>
            
          </div>
        </div> */}
      </div>
    </>
  );
};

export default KeInfo;
