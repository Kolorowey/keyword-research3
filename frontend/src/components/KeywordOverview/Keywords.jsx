import React, { useState } from "react";
import data2 from "../../assets/data2";
import Layout from "../../Pages/Layout";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const keyword = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [keywordData, setKeywordData] = useState(null);

  const handleSearch = () => {
    const result = data2.find(
      (item) => item.keyword.toLowerCase() === searchTerm.toLowerCase()
    );
    setKeywordData(result);
  };

  const getChartData = () => {
    if (!keywordData) return null;
    const labels = keywordData.monthly_searches.map(
      (ms) => `${ms.year}-${ms.month}`
    );
    const data = keywordData.monthly_searches.map((ms) => ms.search_volume);
    return {
      labels,
      datasets: [
        {
          label: "Monthly Searches",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 10,
        },
      ],
    };
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
      y: {
        title: {
          display: false,
          text: "",
        },
      },
    },
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 md:pt-8 w-full h-full flex-grow">
        <div className="p-4 md:p-8 min-h-full rounded-lg bg-gray-100 flex-col flex justify-center items-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">SEO Content</h1>
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a keyword..."
              className="p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleSearch}
              className="ml-2 p-2 bg-blue-500 text-white rounded"
            >
              Search
            </button>
          </div>
          <hr className="my-4 h-[2px]" />
          <div className="h-full">
            {keywordData && (
              <div className="grid grid-cols-1 mt-4 bg-gray-100 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md grid justify-center items-evenly">
                  <h2 className="text-lg md:text-xl font-semibold mb-2">
                    Volume
                  </h2>
                  <p className="text-blue-500 text-md md:text-lg">
                    {keywordData.search_volume} (US)
                  </p>
                  <p className="text-red-600 font-bold">
                    {keywordData.competition_index}% (Very hard)
                  </p>
                  <p className="text-gray-600 text-sm">
                    The hardest keyword to compete for...
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg md:text-xl font-semibold mb-2">
                    Global Volume
                  </h2>
                  <p className="text-blue-500 text-md md:text-lg">
                    {keywordData.search_volume}
                  </p>
                  <ul className="text-gray-600 text-sm">
                    {/* Example data, replace with actual global volume data */}
                     
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg md:text-xl font-semibold mb-2">
                    Intent
                  </h2>
                  <p className="text-green-500">Informational</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-2">
                    Trend
                  </h2>
                  <div className="bg-white h-24">
                  {keywordData && <Bar data={getChartData()} options={options} />}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg md:text-xl font-semibold mb-2">
                    CPC (Cost Per Click)
                  </h2>
                  <p className="text-blue-500 text-md md:text-lg">
                    ${keywordData.cpc}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Competitive Density: 0
                  </p>
                  <p className="text-gray-600 text-sm">PLA: 0</p>
                  <p className="text-gray-600 text-sm">Ads: 0</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default keyword;
