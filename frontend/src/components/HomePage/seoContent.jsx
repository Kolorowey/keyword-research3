import React from "react";

const SEOContent = () => {
    return (
        <div className="grid w-full justify-center   bg-gray-100">

            <div className="grid w-full grid-cols-1 gap-4 pt-8  h-[30rem] py-2 bg-[#fdfaf5] shadow-md  place-items-center">
                <header className="grid w-full py-4 place-items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Quickly check the performance of a domain or keyword
                    </h1>
                </header>
                <main className="grid w-full px-4 mt-8 gap-6 place-items-center">
                    <h2 className="text-3xl font-semibold text-gray-900">
                        Enhance Your Online Visibility
                    </h2>
                    <p className="text-sm text-center text-gray-700">
                        Projects let you keep all your website data in one place and track
                        your progress.
                    </p>
                    <div className="grid grid-cols-[1fr,auto] gap-2 w-full">
                        <input
                            type="text"
                            placeholder="Enter your website name"
                            className="px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button className="px-6 py-2 text-lg font-semibold text-white bg-[#5cacd4] rounded hover:bg-[#2671b8]">
                            Start now
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SEOContent;