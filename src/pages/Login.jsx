import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import marxOutlineBackground from '../assets/marx-outline.png';
import { X, ExternalLink } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
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
            setShowLoginModal(false);
            navigate('/');
        }
        setLoading(false);
    };

    // Login Modal Component
    const LoginModal = () => {
        if (!showLoginModal) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-red-900/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-bold text-red-500">Login</h2>
                        <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
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

    // No longer using the Lenin quote as requested

    return (
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            {/* Login Button (top right) */}
            <div className="absolute top-6 right-6 z-20">
                <button 
                    onClick={() => setShowLoginModal(true)} 
                    className="px-6 py-2 bg-red-600 rounded-full font-medium hover:bg-red-700 transition shadow-lg"
                >
                    Login
                </button>
            </div>
            
            {/* Background elements */}
            <div className="fixed inset-0 z-0">
                <img 
                    src={marxOutlineBackground} 
                    alt="Page background" 
                    className="w-full h-full object-cover" 
                />
            </div>
            <div className="fixed inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none"></div>



            {/* Main Content - Using flex layout to position side by side */}
            <div className="relative z-10 pt-16 pb-16 px-8 w-full">
                                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-6xl font-bold text-red-500 mb-6">Scientific Marxism</h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-2">
                            A Renaissance of Revolutionary Theory and Practice
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-start">
                        {/* Left column */}
                        <div className="lg:w-1/2">
                        
                        {/* About the Creator */}
                        <div className="bg-black/90 backdrop-blur-sm p-5 rounded-lg border border-red-900/50 mb-6">
                            <h2 className="text-2xl font-bold mb-4 text-white">The Vision</h2>
                            <p className="text-gray-200 mb-4">
                                I am Leninistwarrior, as many know me across various platforms. Since November, I have been 
                                dedicated to creating this platform with a singular vision: to revitalize authentic Marxist 
                                analysis and provide a hub for writers with revolutionary potential.
                            </p>
                            <p className="text-gray-200 mb-4">
                                In recent decades, Marxism has been neglected and perverted beyond recognition. This site 
                                aims to correct this trajectory by returning to scientific principles while addressing 
                                contemporary conditions.
                            </p>
                            <p className="text-gray-200 mb-4">
                                This site will primarily function as a writers' collective and community hub. As time progresses
                                and our means increase, the digital library will be filled with essential texts and analysis.
                            </p>
                            <div className="mt-6 flex items-center gap-3">
                                <a 
                                    href="https://x.com/leninistwarrior" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition"
                                >
                                    <span>Follow on Twitter</span>
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                        
                        {/* Support and Donation */}
                        <div className="bg-black/90 backdrop-blur-sm p-5 rounded-lg border border-red-900/50 mb-6">
                            <h2 className="text-2xl font-bold mb-4 text-white">Support This Project</h2>
                            <p className="text-gray-200 mb-4">
                                I humbly request donations to help sustain and grow this platform. Help is greatly appreciated in any form,
                                whether financial contributions, technical assistance, or theoretical contributions.
                            </p>
                            <p className="text-gray-200">
                                Feel free to DM me on Twitter for collaboration opportunities or to discuss how you can support this initiative.
                            </p>
                        </div>
                        
                        {/* Site Pages and Features */}
                        <div className="bg-black/90 backdrop-blur-sm p-5 rounded-lg border border-red-900/50 mb-6">
                            <h2 className="text-2xl font-bold mb-4 text-white">Platform Features</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-red-400">Study Page</h3>
                                    <p className="text-gray-200">
                                        A structured learning environment featuring curated reading lists, study guides, and 
                                        theoretical discussions to develop Marxist understanding systematically.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-semibold text-red-400">Science Page</h3>
                                    <p className="text-gray-200">
                                        As Lenin emphasized, communists should know everything mankind has to offer. This page is 
                                        dedicated to ensuring Marxists are thoroughly educated in natural sciences and all fields of 
                                        human knowledge necessary for comprehensive revolutionary theory.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-semibold text-red-400">Digital Library</h3>
                                    <p className="text-gray-200">
                                        An expanding collection of essential Marxist texts, articles, and analyses, organized 
                                        and annotated for accessibility and theoretical development.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-semibold text-red-400">Data Collection & Analysis</h3>
                                    <p className="text-gray-200">
                                        Since I analyze the economy and capitalism is worldwide, this section provides tools for 
                                        tracking global economic developments and staying updated on the evolving conditions of 
                                        capitalist production and class struggle.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-semibold text-red-400">Writers' Collective</h3>
                                    <p className="text-gray-200">
                                        A collaborative space for developing revolutionary thinkers and writers, emphasizing quality 
                                        theoretical work that contributes to the Marxist tradition.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right column */}
                    <div className="lg:w-1/2 bg-black/80 backdrop-blur-sm rounded-lg border border-red-900/40 p-4">
                        <h2 className="text-2xl font-bold mb-3 text-white">Platform Development</h2>
                        <p className="text-gray-200 mb-3">
                            This platform is being developed with a systematic approach to ensure it serves as a hub for genuine 
                            Marxist thought, research, and organization. Each feature is being carefully designed to provide maximum 
                            utility for revolutionary study and practice.
                        </p>
                        <p className="text-gray-200 mb-3">
                            My development process involves extensive research into both Marxist literature and modern 
                            technological tools that can serve my theoretical and practical needs. I'm creating a 
                            platform that respects the rich history of Marxism while embracing the technology Capitalism gave us. Its grave will be dug by itself.
                        </p>
                        <div className="border-l-4 border-red-500 pl-4 py-2 mb-6">
                            <p className="text-gray-300 italic">
                                "The philosophers have only interpreted the world, in various ways. The point, however, is to change it."
                            </p>
                            <p className="text-red-400 text-sm mt-2">— Karl Marx, Theses on Feuerbach</p>
                        </div>
                    </div>
                </div>
            </div>

                {/* Limited Access Message - Full width at bottom */}
                <div className="text-center bg-red-900/30 backdrop-blur-sm py-8 px-8 rounded-lg border border-red-500/60 mt-8 max-w-5xl mx-auto">
                    <h3 className="text-2xl font-bold mb-4 text-white">Limited Access</h3>
                    <p className="text-xl text-gray-200">
                        This project is open to selected users only.<br />
                        Everyone else, thank you for your patience.<br />
                        <span className="font-medium">Coming soon.</span>
                    </p>
                </div>
            </div>
            {/* Login Modal */}
            <LoginModal />
        </div>
    );
};

export default LoginPage;