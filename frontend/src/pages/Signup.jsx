/**
 * Signup Page Component
 * Professional SaaS-style signup for the Resume Matcher recruiter platform
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BriefcaseIcon, UserIcon, MailIcon, LockIcon, LoaderIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';

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

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const response = await axios.post(`${apiBaseUrl}/auth/signup`, {
                name,
                email,
                password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({ name, email }));

            setLoading(false);
            navigate('/dashboard');
        } catch (err) {
            setLoading(false);

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

    const features = [
        'AI-powered resume screening',
        'Instant candidate ranking',
        'Deep resume insights',
        'Skill-based candidate search',
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
                </div>

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <BriefcaseIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-lg">RecruitAI</span>
                </div>

                {/* Headline */}
                <div className="relative">
                    <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-3 py-1.5 mb-6">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                        <span className="text-indigo-300 text-xs font-semibold tracking-wide">Free to get started</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                        Your AI recruiting<br />assistant awaits.
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed mb-8">
                        Join recruiters who are saving hours every week with intelligent resume screening.
                    </p>

                    {/* Feature list */}
                    <ul className="space-y-3">
                        {features.map((f) => (
                            <li key={f} className="flex items-center gap-3">
                                <CheckCircleIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <span className="text-slate-300 text-sm">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer quote */}
                <div className="relative border-l-2 border-indigo-500/40 pl-4">
                    <p className="text-slate-400 text-sm italic leading-relaxed">
                        &ldquo;RecruitAI cut our screening time by 60%. We now focus only on the best fits.&rdquo;
                    </p>
                    <p className="text-slate-500 text-xs mt-1">— HR Lead, Tech Startup</p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <BriefcaseIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-900 font-bold text-lg">RecruitAI</span>
                </div>

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
                        <p className="text-slate-500 text-sm">Start screening smarter in minutes</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
                            <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Full name
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Smith"
                                    required
                                    className="saas-input pl-9"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Work email
                            </label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="saas-input pl-9"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    required
                                    className="saas-input pl-9"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mt-2"
                        >
                            {loading ? (
                                <>
                                    <LoaderIcon className="w-4 h-4 animate-spin-slow" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <span>Create account</span>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-xs text-slate-400 mt-12">© 2026 RecruitAI. All rights reserved.</p>
            </div>
        </div>
    );
}
