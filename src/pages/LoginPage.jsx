import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, user } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    useEffect(() => {
        if (user) {
            setEmail("");
            setPassword("");
            navigate("/chat");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
            <div className="relative bg-white rounded-3xl shadow-2xl 
                p-6 sm:p-8 md:p-12 
                w-full max-w-lg sm:max-w-xl md:max-w-2xl 
                backdrop-blur-sm border border-gray-100">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <div className="text-center sm:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold mb-1">Sign in</h1>
                        <p className="text-gray-500 text-sm sm:text-base">
                            Welcome back to your account
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/signup")}
                        className="group flex items-center space-x-2 
                        text-xs sm:text-sm font-medium 
                        text-gray-700 hover:text-green-600 
                        transition-colors px-3 py-2
                        rounded-lg hover:bg-green-50"
                    >
                        <span>Don't have an account?</span>
                        <span className="text-green-600 group-hover:translate-x-1 transition-transform">
                            Sign Up
                        </span>
                    </button>
                </div>

                {/* Divider */}
                <div className="relative mb-8 mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 sm:px-3 text-gray-500 font-medium">
                            Account Login
                        </span>
                    </div>
                </div>

                {/* Chat icon + welcome */}
                <div className="flex flex-col items-center mt-6 mb-8">
                    <img
                        src="/images/chat-icon.jpg"
                        alt="Chat Icon"
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 
                        mb-4 transition-transform duration-300 ease-in-out hover:scale-110"
                    />
                    <h2 className="text-xl sm:text-2xl font-bold mb-1 text-center">
                        Welcome back
                    </h2>
                    <p className="text-gray-500 text-center text-sm sm:text-base">
                        Sign in to continue to your account
                    </p>
                </div>

                {/* Login form */}
                <div className="w-full max-w-md p-4 sm:p-6 mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-lg 
                                focus:ring-2 focus:ring-green-400 outline-none text-sm sm:text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-lg 
                                focus:ring-2 focus:ring-green-400 outline-none text-sm sm:text-base"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-500 hover:bg-green-600 
                            text-white py-2 rounded-lg font-semibold 
                            transition text-sm sm:text-base"
                        >
                            {loading ? "Signing in..." : "Sign in →"}
                        </button>
                    </form>

                    <p className="text-xs text-center text-gray-400 mt-6">
                        Secure authentication powered by Firebase
                    </p>
                </div>
            </div>
        </div>
    );
}
