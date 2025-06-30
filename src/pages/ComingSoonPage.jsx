import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ComingSoonPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
            <Header />
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
                        Coming Soon
                    </h1>
                    <div className="h-1 w-24 bg-red-600 mx-auto mb-8"></div>
                    
                    <p className="text-xl md:text-2xl mb-8 text-gray-300">
                        This section is under active development and will be available soon.
                    </p>
                    
                    <div className="bg-black/30 p-8 rounded-lg border border-red-900/20 mb-12">
                        <h2 className="text-2xl font-semibold mb-4">What to expect</h2>
                        <p className="text-gray-400 mb-4">
                            I'm working on a revolutionary platform for Marxist theory, education, and analysis. 
                            I am building a comprehensive library of resources, interactive study tools, 
                            and collaborative research features.
                        </p>
                        <p className="text-gray-400">
                            Check back soon or sign up for updates to be notified when this feature launches.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center justify-center mx-auto bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Return to Homepage
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComingSoonPage;
