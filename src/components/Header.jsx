import React, { useState, useEffect } from 'react';
import { Menu, Globe, LogOut, BarChart, BookOpen, FileText, Home, BookMarked, LineChart, Sun, Moon, Users, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';

const Header = () => {
    
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);

    const isActive = (path) => {
        return location.pathname === path;
    };



    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setUserRole(null);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (data) setUserRole(data.is_admin ? 'admin' : null);

            } catch (error) {
                console.error('Error fetching user role in header:', error);
            }
        };

        fetchUserRole();
    }, [user]);
    
    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/theory', label: 'Revolutionary Theory', icon: BookMarked },
        { path: '/analysis', label: 'Analysis', icon: FileText },
        { path: '/digital-library', label: 'Digital Library', icon: BookOpen },
        { path: '/study', label: 'Study Center', icon: BarChart },
        { path: '/science-tech', label: 'Science & Tech', icon: FileText },
        { path: '/visualizations', label: 'Data', icon: LineChart },
        { path: '/directory', label: 'Directory', icon: Users }
    ];
    
    return (
        <header className="fixed top-0 w-full bg-black text-white py-3 z-50 border-b border-gray-800">
            <div className="container mx-auto flex justify-between items-center px-4">
                <Link to="/" className="text-xl font-bold tracking-wider">
                    Marxist.info
                </Link>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center">
                    <nav className="flex items-center">
                        {navItems.map((item) => (
                            <Link 
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-2 text-sm font-medium hover:text-red-400 transition-colors ${
                                    isActive(item.path) ? 'text-red-500' : 'text-gray-300'
                                }`}
                            >
                                <span>{item.label}</span>
                            </Link>
                        ))}
                        {userRole === 'admin' && (
                            <div className="relative group">
                                <div className="flex items-center px-4 py-2 text-sm font-medium hover:text-red-400 transition-colors cursor-pointer">
                                    <Shield size={16} className="mr-2" />
                                    <span>Admin</span>
                                </div>
                                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-1">
                                        <Link 
                                            to="/admin/tags"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/tags') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            Category & Tag Management
                                        </Link>
                                        <Link 
                                            to="/admin/submissions"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/submissions') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            Review Submissions
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                        {user && (
                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                                My Profile
                            </Link>
                        )}
                    </nav>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                            title='Toggle Theme'
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                            title='Logout'
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 hover:bg-gray-800 rounded-full transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black pt-16">
                    <div className="container mx-auto px-4 py-8 flex flex-col">
                        <div className="flex justify-end mb-4">
                            <button 
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Menu className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <nav className="flex flex-col space-y-6">
                            {navItems.map((item) => (
                                <Link 
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center text-lg font-medium hover:text-red-400 transition-colors ${
                                        isActive(item.path) ? 'text-red-500' : 'text-white'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                            {userRole === 'admin' && (
                                <Link 
                                    to="/admin/tags"
                                    className={`flex items-center text-lg font-medium hover:text-red-400 transition-colors ${
                                        isActive('/admin/tags') ? 'text-red-500' : 'text-white'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Shield size={20} className="mr-2" />
                                    <span>Admin</span>
                                </Link>
                            )}
                            {user && (
                                <Link 
                                    to="/profile"
                                    className={`flex items-center text-lg font-medium hover:text-red-400 transition-colors text-white`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span>My Profile</span>
                                </Link>
                            )}

                        </nav>
                        <div className="mt-8 flex justify-center space-x-6">
                            <button
                                onClick={() => {
                                    toggleTheme();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;