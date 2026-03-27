/**
 * Signup Page Component
 * Displays the signup form for user registration
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        // TODO: Replace with actual backend API call
        // Example: const response = await axios.post('https://api.example.com/signup', { name, email, password });
        // Then: localStorage.setItem('token', response.data.token);

        // For now, simulate API call with mock JWT token
        try {
            // Send POST request to backend signup API using environment variable
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const response = await axios.post(`${apiBaseUrl}/auth/signup`, {
                name,
                email,
                password
            });

            // Store JWT token from response
            localStorage.setItem('token', response.data.token);

            // Optional: Store user info (without password)
            localStorage.setItem('user', JSON.stringify({ name, email }));

            setLoading(false);

            // Redirect to dashboard on successful signup
            navigate('/dashboard');
        } catch (err) {
            setLoading(false);

            // Handle different error scenarios
            if (err.response && err.response.status === 400) {
                setError(err.response.data.message || 'Signup failed');
            } else if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.message === 'Network Error') {
                setError('Cannot connect to server. Please check your internet connection.');
            } else {
                setError('Signup failed. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            {/* Main Card Container */}
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 rounded-full mb-4">
                        <span className="text-2xl">✨</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join our platform to start screening resumes</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition duration-200"
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition duration-200"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition duration-200"
                        />
                    </div>

                    {/* Signup Button */}
                    <button
                        type="button"
                        onClick={handleSignup}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Creating account...</span>
                            </>
                        ) : (
                            <span>Create Account</span>
                        )}
                    </button>
                </div>

                {/* Login Link */}
                <div className="text-center mt-8">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/" className="text-green-600 hover:text-green-700 font-semibold transition hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-gray-500">
                    <p>© 2024 Resume Matcher. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
