import React, { useState } from "react";
import "@lottiefiles/lottie-player";
import { Link } from "react-router-dom";
import './css/LoginForm.css'; 

function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log({ username, password, rememberMe });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#f5f5f5] animate-fadeIn">
            <form
                onSubmit={handleSubmit}
                className="bg-[#f5f5f5] p-1 md:p-16 lg:p-32 rounded-lg w-full max-w-[40rem] animate-slideIn"
            >
                <h2 className="text-center text-2xl font-semibold mb-14">LOGIN</h2>
                <input
                    type="text"
                    placeholder="Username/Email"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 mb-8 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-colors duration-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-colors duration-500"
                />
                <div className="flex justify-between items-center mb-8">
                    <label className="flex items-center">
                        <input
                            required
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="mr-2"
                        />
                        Remember me
                    </label>
                    <a href="#" className="text-blue-500 hover:underline">
                        Forgot?
                    </a>
                </div>
                <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    LOGIN
                </button>
                <div className="flex justify-center mt-10">
                    <span>Don’t have an account?</span>
                    <Link to="/signup" className="ml-3 text-blue-500">
                        Sign Up
                    </Link>
                </div>
            </form>
            <div className="  justify-center mt-8 hidden md:block animate-fadeIn">
                <lottie-player
                    src="https://lottie.host/3bc376b5-f198-4081-83a5-a5c5b98f9b74/FrytdcOrLQ.json"
                    background="##FFFFFF"
                    speed="1"
                    style={{ width: '100%', maxWidth: '600px', height: 'auto' }}
                    loop
                    nocontrols
                    autoplay
                    direction="1"
                    mode="normal"
                ></lottie-player>
            </div>
        </div>
    );
}

export default LoginForm;
