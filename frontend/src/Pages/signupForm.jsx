import React, { useState } from "react";
import "@lottiefiles/lottie-player";
import { Link } from "react-router-dom";

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({ name, email, password });
  };

  return (
    <>
      <meta charSet="UTF-8" />
      <div className="flex justify-center items-center min-h-screen bg-[#f5f5f5] gap-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="hidden md:block justify-center mt-8">
          <lottie-player
            src="https://lottie.host/7fda0f3b-e0eb-483c-af77-e97984c78370/3hNlQIlDeU.json"
            background="##FFFFFF"
            speed="0.5"
            style={{ width: "300px", height: "300px" }}
            nocontrols
            autoplay
            direction="1"
            mode="normal"
          ></lottie-player>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-[#f5f5f5] p-1 md:p-16 lg:p-32 rounded-lg w-full max-w-[40rem]"
        >
          <h2 className="text-center text-2xl font-semibold mb-14">SIGN UP</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-8 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-colors duration-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-8 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-colors duration-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-8 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-colors duration-500"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            SIGN UP
          </button>
          <div className="flex justify-center mt-8">
            <span>Already have an account?</span>
            <Link to="/login" className="ml-3 text-blue-500">
              Login
            </Link>
          </div>
          <div className="flex justify-center mt-8">
            <button
              type="button"
              className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Sign Up with Google
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default SignupForm;
