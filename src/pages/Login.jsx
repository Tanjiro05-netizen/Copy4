import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(credentials.username, credentials.password)) {
            navigate('/');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <nav className="p-5 flex justify-between bg-transparent">
                <div className="font-bold text-2xl">MARXIST.THEORY</div>
            </nav>

            {/* Background Image Container */}
            <div className="fixed inset-0 z-0">
                <div
                    className="w-full h-full opacity-20"
                    style={{
                        backgroundImage: "url('/images/marx-outline.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            </div>

            {/* Login Form Container */}
            <div className="relative z-10 h-[calc(100vh-64px)] flex justify-center items-center">
                <div className="bg-black/30 backdrop-blur-sm p-10 rounded-lg w-[90%] max-w-[400px] border border-red-900/30">
                    <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className="block mb-1">Username</label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                                required
                                className="w-full p-2 bg-black/50 border border-red-500/30 text-white rounded focus:outline-none focus:border-red-500/60"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block mb-1">Password</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                required
                                className="w-full p-2 bg-black/50 border border-red-500/30 text-white rounded focus:outline-none focus:border-red-500/60"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-red-600 text-white rounded cursor-pointer hover:bg-red-700 transition-colors mt-5"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>

            <div className="fixed inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>
        </div>
    );
};

export default Login;