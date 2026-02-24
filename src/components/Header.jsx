import React, { useState } from 'react';
import { Menu, LogOut, BarChart, BookOpen, FileText, Home, BookMarked, LineChart, Sun, Moon, Users, Shield, MessageSquare, HelpCircle, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
    const { user, profile, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    // All nav items - some are guest-accessible, others require login
    const allNavItems = [
        { path: '/home', label: 'Home', icon: Home, guestAccessible: true },
        {
            label: 'Revolutionary Theory',
            icon: BookMarked,
            guestAccessible: false,
            children: [
                { path: '/theory', label: 'Read', description: 'Browse & read theory articles' },
                { path: '/analysis', label: 'Analyze', description: 'Deep analysis tools & texts' },
            ],
        },
        { path: '/digital-library', label: 'Digital Library', icon: BookOpen, guestAccessible: true },
        { path: '/study', label: 'Study Center', icon: BarChart, guestAccessible: false },
        { path: '/science-tech', label: 'Science & Tech', icon: FileText, guestAccessible: false },
        { path: '/politics', label: 'Politics', icon: FileText, guestAccessible: false },
        { path: '/visualizations', label: 'Data', icon: LineChart, guestAccessible: false },
        { path: '/directory', label: 'Directory', icon: Users, guestAccessible: false },
        { path: '/forum', label: 'Forum', icon: MessageSquare, guestAccessible: true },
        { path: '/knowledge', label: 'Knowledge Q&A', icon: HelpCircle, guestAccessible: false }
    ];
    
    // Show all nav items to everyone (guests see "Coming Soon" for restricted ones)
    const navItems = allNavItems;
    
    return (
        <header className="fixed top-0 w-full bg-black text-white py-3 z-50 border-b border-gray-800">
            <div className="container mx-auto flex justify-between items-center px-4">
                <Link to="/" className="text-xl font-bold tracking-wider">
                    Marxist.info
                </Link>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center">
                    <nav className="flex items-center">
                        {navItems.map((item) => {
                            const isRestricted = !user && !item.guestAccessible;

                            if (item.children) {
                                const anyChildActive = item.children.some(c => isActive(c.path));
                                return (
                                    <div key={item.label} className="relative group">
                                        <button
                                            className={`flex items-center px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                                isRestricted
                                                    ? 'text-gray-600 hover:text-gray-500'
                                                    : anyChildActive ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                                            }`}
                                        >
                                            <span>{item.label}</span>
                                            <ChevronDown size={14} className="ml-1" />
                                            {isRestricted && <span className="ml-1 text-[10px] text-gray-600">✦</span>}
                                        </button>
                                        <div className="absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-black border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="py-1">
                                                {item.children.map(child => (
                                                    <Link
                                                        key={child.path}
                                                        to={isRestricted ? '/coming-soon' : child.path}
                                                        className={`block px-4 py-2.5 text-sm transition-colors ${
                                                            isActive(child.path)
                                                                ? 'bg-gray-900 text-white'
                                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="font-medium">{child.label}</span>
                                                        {child.description && (
                                                            <span className="block text-xs text-gray-500 mt-0.5">{child.description}</span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link 
                                    key={item.path}
                                    to={isRestricted ? '/coming-soon' : item.path}
                                    className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                                        isRestricted
                                            ? 'text-gray-600 hover:text-gray-500'
                                            : isActive(item.path) ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                                    }`}
                                    title={isRestricted ? 'Coming Soon' : ''}
                                >
                                    <span>{item.label}</span>
                                    {isRestricted && <span className="ml-1 text-[10px] text-gray-600">✦</span>}
                                </Link>
                            );
                        })}
                        {isAdmin() && (
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
                                        <Link 
                                            to="/admin/knowledge"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/knowledge') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            Knowledge Moderation
                                        </Link>
                                        <Link 
                                            to="/admin/quizzes"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/quizzes') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            Quiz Management
                                        </Link>
                                        <Link 
                                            to="/admin/scenarios"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/scenarios') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            Scenario Management
                                        </Link>
                                        <Link 
                                            to="/admin/world-sim"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/world-sim') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            World Sim
                                        </Link>
                                        <Link 
                                            to="/admin/analysis/upload"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/analysis/upload') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            Upload Analysis Text
                                        </Link>
                                        <Link 
                                            to="/admin/library/upload"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/library/upload') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            Library Upload
                                        </Link>
                                        <Link 
                                            to="/admin/stem"
                                            className={`flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white ${
                                                isActive('/admin/stem') ? 'bg-gray-900 text-white' : ''
                                            }`}
                                        >
                                            STEM Courses
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
                        
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                                title='Logout'
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        ) : (
                            <Link
                                to="/"
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                Log In
                            </Link>
                        )}
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
                            {navItems.map((item) => {
                                const isRestricted = !user && !item.guestAccessible;

                                if (item.children) {
                                    return (
                                        <div key={item.label} className="space-y-2">
                                            <span className="text-lg font-medium text-gray-400">{item.label}</span>
                                            <div className="pl-4 space-y-3">
                                                {item.children.map(child => (
                                                    <Link
                                                        key={child.path}
                                                        to={isRestricted ? '/coming-soon' : child.path}
                                                        className={`block text-base font-medium transition-colors ${
                                                            isActive(child.path) ? 'text-red-500' : 'text-white hover:text-red-400'
                                                        }`}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        {child.label}
                                                        {child.description && (
                                                            <span className="block text-xs text-gray-500">{child.description}</span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <Link 
                                        key={item.path}
                                        to={isRestricted ? '/coming-soon' : item.path}
                                        className={`flex items-center text-lg font-medium transition-colors ${
                                            isRestricted
                                                ? 'text-gray-600 hover:text-gray-500'
                                                : isActive(item.path) ? 'text-red-500' : 'text-white hover:text-red-400'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>{item.label}</span>
                                        {isRestricted && <span className="ml-2 text-xs text-gray-600">Coming Soon</span>}
                                    </Link>
                                );
                            })}
                            {isAdmin() && (
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
                            {user ? (
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
                            ) : (
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                                >
                                    Log In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;