import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="navber">
      {/* component */}
      <div className="min-h-20vh bg-white">
        <style>
          {`
            @media only screen and (min-width: 768px) {
                .parent:hover .child {
                    opacity: 1;
                    height: auto;
                    overflow: visible;
                    transform: translateY(0);
                }
                .child {
                    opacity: 0;
                    height: 0;
                    overflow: hidden;
                    transform: translateY(-10%);
                }
            }
            /* Added z-index to ensure navbar is above other components */
            .navber {
              position: relative;
              z-index: 10; /* Ensure this is higher than keywordExp */
            }
            `}
        </style>

        <nav className="flex px-4 border-b   items-center relative">
          <div className="text-lg font-bold md:py-0 py-4">
            <span className="text-blue-500"> K </span>
            <span className="text-slate-400">M</span>
          </div>
          <div className="ml-auto md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 fill-current cursor-pointer"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 fill-current cursor-pointer"
                viewBox="0 0 24 24"
              >
                <path d="M0 3h24v2H0V3zm0 7h24v2H0v-2zm0 7h24v2H0v-2z" />
              </svg>
            )}
          </div>
          <ul
            className={`md:px-2 ml-auto md:flex md:space-x-2 absolute md:relative top-full left-0 right-0 ${isOpen ? "block bg-white" : "hidden"
              }`}
          >
            <li>
              <a
                href="#"
                className="flex md:inline-flex p-4 items-center hover:bg-gray-50"
              >
                <span>Home</span>
              </a>
            </li>
            <li className="relative parent">
              <a
                href="#"
                className="flex justify-between md:inline-flex p-4 items-center hover:bg-gray-50 space-x-2"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span> SEO Tools</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 fill-current pt-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
                </svg>
              </a>
              <ul
                className={`child transition duration-300 md:absolute top-full right-0 md:w-48 bg-white md:shadow-lg md:rounded-b ${dropdownOpen ? "block" : "hidden"
                  }`}
              >
                <li className="block">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Keyword Explorer
                  </a>
                </li>
                <li className="block">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Keyword Volume Checker
                  </a>
                </li>
                <li className="block">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Keyword Difficulty Checker
                  </a>
                </li>
                <li className="block">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Keyword shitted tool
                  </a>
                </li>
                <li className="block">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Longtail keyword generator
                  </a>
                </li>
                <li className="block">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Insta Keyword Tool
                  </a>
                </li>

                <li className="block">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Website Keyword Checker
                  </a>
                </li>
                <li className="block">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Competing Domain
                  </a>
                </li>
              </ul>
            </li>
            <li className="relative parent">
              <a
                href="#"
                className="flex justify-between md:inline-flex p-4 items-center hover:bg-gray-50 space-x-2"
                onClick={() => {
                  setDropdownOpen(false);
                  setServiceDropdownOpen(!serviceDropdownOpen);
                }}
              >
                <span>Communities</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 fill-current pt-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
                </svg>
              </a>
              <ul
                className={`child transition duration-300 md:absolute top-full right-0 md:w-48 bg-white md:shadow-lg md:rounded-b ${serviceDropdownOpen ? "block" : "hidden"
                  }`}
              >
                <li>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Telegram
                  </a>
                </li>
                <li>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Facebook
                  </a>
                </li>
              </ul>
            </li>
            <li className="relative parent">
              <a
                href="#"
                className="flex justify-between md:inline-flex p-4 items-center hover:bg-gray-50 space-x-2"
                onClick={() => {
                  setDropdownOpen(false);
                  setResourcesDropdownOpen(!resourcesDropdownOpen);
                }}
              >
                <span>Resources</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 fill-current pt-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
                </svg>
              </a>
              <ul
                className={`child transition duration-300 md:absolute top-full right-0 md:w-48 bg-white md:shadow-lg md:rounded-b ${resourcesDropdownOpen ? "block" : "hidden"
                  }`}
              >
                <li>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Blogs
                  </a>
                </li>
                <li>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Forum
                  </a>
                </li>
                <li>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-50">
                    Web Stories
                  </a>
                </li>
              </ul>
            </li>

            <li>
              <a
                href="#"
                className="flex md:inline-flex p-4 items-center hover:bg-gray-50"
              >
                <span>About us</span>
              </a>
            </li>
            <div className="ml-auto hidden md:flex space-x-4">
              {!isLoggedIn && (
                <>
                  <div className="text-white px-4 py-2">
                    <button className="bg-gray-500 p-2 rounded-lg">
                      Log in
                    </button>
                  </div>
                  <div className="text-white px-4 py-2">
                    <button className="bg-green-300 p-2 rounded-lg">
                      Sign up
                    </button>
                  </div>
                </>
              )}
            </div>
          </ul>


          {/* <div className="ml-auto flex items-center space-x-4">
            <div className="relative parent">
              <a
                href="#"
                className="flex items-center hover:bg-gray-50 space-x-2"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </a>
              <ul
                className={`child transition duration-300 absolute top-full right-0 w-48 bg-white shadow-lg rounded-b ${
                  profileDropdownOpen ? "block" : "hidden"
                }`}
              >
                <li>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                    Login
                  </button>
                </li>
                <li>
                  <button className="bg-green-500 text-white px-4 py-2 rounded w-full">
                    Signup
                  </button>
                </li>
              </ul>
            </div>
          </div> */}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
