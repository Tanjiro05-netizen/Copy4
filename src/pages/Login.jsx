import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await login({ email, password });
        if (error) {
            setError(error.message);
        } else {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center relative overflow-hidden">
            {/* Background elements from the original design */}
            <div className="fixed inset-0 z-0">
                <div className="w-full h-full opacity-20 login-background"></div>
            </div>
            <div className="fixed inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

            {/* Login Form Container */}
            <div className="relative z-10 max-w-md w-full p-8 space-y-8 bg-black/50 backdrop-blur-sm border border-red-900/40 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-red-500">Login</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-900/70 border border-red-500/30 rounded-lg focus:border-red-500 focus:outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-900/70 border border-red-500/30 rounded-lg focus:border-red-500 focus:outline-none transition"
                            required
                        />
                    </div>
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;