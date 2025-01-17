import React from "react";

const Footer = () => {
  return (
    <>
      <div id="footer" className="mt-auto w-full ">
        <div className="footer-content w-full rounded-md bg-[#678590] text-white py-8 p-4 md:p-8 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="footer-content-left w-full md:w-1/4 lg:w-[150%] text-left">
            <h1 className="mb-4">
                <span className="text-blue-400 text-3xl font-semibold">K</span>
                <span className="text-gray-400 text-3xl font-semibold mx-4">M</span>
            </h1>
            <h3 className="text-gray-200 text-pretty-text text-justify leading-7">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis
              fugit impedit nam perferendis qui voluptatum est. Quod reiciendis
              eum corrupti laborum earum soluta corporis, voluptatem, eligendi
              expedita consequuntur beatae recusandae sit praesentium
              architecto. Dolorum vel aperiam culpa exercitationem fuga
              molestiae sequi officiis nobis vitae rem.
            </h3>
          </div>
          
          <div className="footer-content w-full text-center grid grid-rows-auto justify-center row-gap-8" style={{rowGap: "0.5rem"}}>
            <h1 className="text-white text-2xl font-semibold ">Free SEO Tools →</h1>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Keyword Explorer</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Keyword Volume Checker</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Keyword Difficulty Checker</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Keyword shitted tool</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Longtail keyword generator</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Insta Keyword Tool</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Website Keyword Checker</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer"> Competing Domain</p>
          </div>
          <div className="footer-content-contact  w-full text-justify grid grid-rows-auto justify-center row-gap-8" style={{rowGap: "0.5rem"}}>
            <h1 className="text-white text-2xl font-semibold">Community→</h1>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">WhatsApp</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Youtube</p>
            <p className="text-gray-300 hover:text-orange-500 cursor-pointer">Telegram</p>
          </div>
          <div className="w-full flex flex-col md:flex-row justify-center items-center mt-36">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="p-2 rounded-l-md border border-orange-300 mb-2 md:mb-0 md:mr-2 w-full md:w-auto" 
            />
            <button className="bg-orange-500 text-white p-2 rounded-r-md hover:bg-blue-600">
              Subscribe
            </button>
          </div>
        </div>
        <div className="bg-gray-700">
          <p className="text-gray-300 text-center">© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Footer;
