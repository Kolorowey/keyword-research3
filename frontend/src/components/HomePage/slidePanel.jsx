import React, { useState } from "react";

const SidePanel = () => {
  const [isSeoOpen, setSeoOpen] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isLocalOpen, setLocalOpen] = useState(false);
  const [isPanelOpen, setPanelOpen] = useState(false);

  const toggleSeoDropdown = () => {
    setSeoOpen(!isSeoOpen);
  };
  const toggleLocalDropdown = () => {
    setLocalOpen(!isLocalOpen);
  };
  const openPanel = () => {
    setPanelOpen(true);
  };
  const closePanel = () => {
    setPanelOpen(false);
  };

  return (
    <>
      <button className="md:hidden p-4" onClick={openPanel}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isPanelOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out box-border md:relative md:translate-x-0 w-64 md:w-1/4 lg:w-1/5 bg-gray-200 rounded-sm  border-r-2 border-gray-400shadow-100 p-4 h-full overflow-y-auto z-50`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800"> </h2>
          <button className="md:hidden" onClick={closePanel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <ul className="space-y-2">
          <li className="bg-white p-3 shadow-md">
            <a href="#" className="text-gray-800 hover:text-blue-500 ">
              Home
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={() => {
                toggleSeoDropdown();
                setActive(!isActive);
              }}
              className={`text-gray-800 font-bold flex items-center justify-between ${
                isActive ? "text-blue-500" : ""
              }`}
            >
              SEO
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transform transition-transform duration-300 ${
                  isSeoOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
            {isSeoOpen && (
              <ul className="pl-4 mt-2 space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-800 text-sm hover:text-blue-500"
                  >
                    SEO Dashboard
                  </a>
                </li>
                <li>
                  <span className="block text-gray-600 font-semibold">
                    COMPETITIVE RESEARCH
                  </span>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Domain Overview
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Traffic Analytics
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Organic Research
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Keyword Gap
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Backlink Gap
                  </a>
                </li>
                <li>
                  <span className="block text-gray-600 font-semibold">
                    KEYWORD RESEARCH
                  </span>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Keyword Overview
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Keyword Magic Tool
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Keyword Strategy Builder
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Position Tracking
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Organic Traffic Insights
                  </a>
                </li>
                <li>
                  <span className="block text-gray-600">LINK BUILDING</span>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Backlink Analytics
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Backlink Audit
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Link Building Tool
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-500 text-sm"
                  >
                    Bulk Analysis
                  </a>
                </li>
              </ul>
            )}
          </li>
          <li>
            <a
              href="#"
              onClick={() => {
                toggleLocalDropdown();
                setLocalOpen(!isLocalOpen);
              }}
              className={`text-gray-800 font-bold flex items-center justify-between ${
                isLocalOpen ? "text-blue-500" : ""
              }`}
            >
              Local
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transform transition-transform duration-300 ${
                  isLocalOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
            {isLocalOpen && (
              <ul className="pl-4 mt-2 space-y-2">
                <li>
                  <a href="#" className="text-gray-800 hover:text-blue-500">
                    List Item 1
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-800 hover:text-blue-500">
                    List Item 2
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-800 hover:text-blue-500">
                    List Item 3
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-800 hover:text-blue-500">
                    List Item 4
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-800 hover:text-blue-500">
                    List Item 5
                  </a>
                </li>
              </ul>
            )}
          </li>
        </ul>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">
          Management
        </h2>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-gray-800 hover:text-blue-500">
              OPT1
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-800 hover:text-blue-500">
              OPT2
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-800 hover:text-blue-500">
              OPT3
            </a>
          </li>
        </ul>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">
          More Options
        </h2>
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="text-gray-800 hover:text-blue-500 font-serif"
            >
              Profile
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-800 hover:text-blue-500">
              Logout
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default SidePanel;
