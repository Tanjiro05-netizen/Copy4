import React, { useState } from 'react';
import { Menu, LogOut, BarChart, BookOpen, FileText, Home, BookMarked, LineChart, Users, Shield, MessageSquare, HelpCircle, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as s from './Header.css.ts';

const Header = () => {
    const { user, logout, isAdmin, canManagePolitics } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isAdminUser = isAdmin();
    const canEditPolitics = canManagePolitics();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
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
        <header className={s.header}>
            <div className={s.headerInner}>
                <Link to="/" className={s.logo}>
                    Marxist.info
                </Link>
                
                {/* Desktop Navigation */}
                <div className={s.desktopNav}>
                    <nav className={s.navRow}>
                        {navItems.map((item) => {
                            const isRestricted = !user && !item.guestAccessible;

                            if (item.children) {
                                const anyChildActive = item.children.some(c => isActive(c.path));
                                return (
                                    <div key={item.label} className={s.dropdownWrap}>
                                        <button
                                            className={`${s.dropdownTrigger} ${isRestricted ? s.navLinkRestricted : anyChildActive ? s.dropdownTriggerActive : ''}`}
                                        >
                                            <span>{item.label}</span>
                                            <ChevronDown size={14} style={{ marginLeft: 4 }} />
                                            {isRestricted && <span className={s.restrictedMark}>✦</span>}
                                        </button>
                                        <div className={s.dropdownMenu}>
                                                {item.children.map(child => (
                                                    <Link
                                                        key={child.path}
                                                        to={isRestricted ? '/coming-soon' : child.path}
                                                        className={`${s.dropdownItem} ${isActive(child.path) ? s.dropdownItemActive : ''}`}
                                                    >
                                                        <span className={s.dropdownItemLabel}>{child.label}</span>
                                                        {child.description && (
                                                            <span className={s.dropdownItemDesc}>{child.description}</span>
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
                                    className={`${s.navLink} ${isRestricted ? s.navLinkRestricted : isActive(item.path) ? s.navLinkActive : ''}`}
                                    title={isRestricted ? 'Coming Soon' : ''}
                                >
                                    <span>{item.label}</span>
                                    {isRestricted && <span className={s.restrictedMark}>✦</span>}
                                </Link>
                            );
                        })}
                        {canEditPolitics && !isAdminUser && (
                            <div className={s.dropdownWrap}>
                                <div className={s.dropdownTrigger}>
                                    <FileText size={16} style={{ marginRight: 8 }} />
                                    <span>Editorial</span>
                                </div>
                                <div className={s.dropdownMenu}>
                                        <Link
                                            to="/admin/politics/upload"
                                            className={`${s.dropdownItem} ${isActive('/admin/politics/upload') ? s.dropdownItemActive : ''}`}
                                        >
                                            Politics Upload
                                        </Link>
                                </div>
                            </div>
                        )}

                        {isAdminUser && (
                            <div className={s.dropdownWrap}>
                                <div className={s.dropdownTrigger}>
                                    <Shield size={16} style={{ marginRight: 8 }} />
                                    <span>Admin</span>
                                </div>
                                <div className={s.dropdownMenu}>
                                        {[
                                            { to: '/admin/tags', label: 'Category & Tag Management' },
                                            { to: '/admin/roles', label: 'User Role Management' },
                                            { to: '/admin/submissions', label: 'Review Submissions' },
                                            { to: '/admin/knowledge', label: 'Knowledge Moderation' },
                                            { to: '/admin/quizzes', label: 'Quiz Management' },
                                            { to: '/admin/scenarios', label: 'Scenario Management' },
                                            { to: '/admin/world-sim', label: 'World Sim' },
                                            { to: '/admin/analysis/upload', label: 'Upload Analysis Text' },
                                            { to: '/admin/library/upload', label: 'Library Upload' },
                                            { to: '/admin/politics/upload', label: 'Politics Upload' },
                                            { to: '/admin/stem', label: 'STEM Courses' },
                                        ].map((link) => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className={`${s.dropdownItem} ${isActive(link.to) ? s.dropdownItemActive : ''}`}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        )}
                        {user && (
                            <Link to="/profile" className={s.navLink}>
                                My Profile
                            </Link>
                        )}
                    </nav>
                    
                    <div className={s.actionsRow}>
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className={s.iconButton}
                                title='Logout'
                            >
                                <LogOut size={18} />
                            </button>
                        ) : (
                            <Link to="/" className={s.loginButton}>
                                Log In
                            </Link>
                        )}
                    </div>
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                    className={s.mobileMenuBtn}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu size={22} />
                </button>
            </div>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className={s.mobileOverlay}>
                    <div className={s.mobileInner}>
                        <div className={s.mobileCloseRow}>
                            <button className={s.iconButton} onClick={() => setMobileMenuOpen(false)}>
                                <Menu size={22} />
                            </button>
                        </div>
                        <nav className={s.mobileNavStack}>
                            {navItems.map((item) => {
                                const isRestricted = !user && !item.guestAccessible;

                                if (item.children) {
                                    return (
                                        <div key={item.label}>
                                            <span className={s.mobileGroupLabel}>{item.label}</span>
                                            <div className={s.mobileSubStack}>
                                                {item.children.map(child => (
                                                    <Link
                                                        key={child.path}
                                                        to={isRestricted ? '/coming-soon' : child.path}
                                                        className={`${s.mobileSubLink} ${isActive(child.path) ? s.mobileLinkActive : ''}`}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        {child.label}
                                                        {child.description && (
                                                            <span className={s.mobileSubDesc}>{child.description}</span>
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
                                        className={`${s.mobileLink} ${isRestricted ? s.mobileLinkRestricted : isActive(item.path) ? s.mobileLinkActive : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>{item.label}</span>
                                        {isRestricted && <span className={s.mobileComingSoon}>Coming Soon</span>}
                                    </Link>
                                );
                            })}
                            {isAdminUser && (
                                <>
                                    <Link
                                        to="/admin/tags"
                                        className={`${s.mobileLink} ${isActive('/admin/tags') ? s.mobileLinkActive : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Shield size={20} style={{ marginRight: 8 }} />
                                        <span>Admin Tools</span>
                                    </Link>
                                    <Link
                                        to="/admin/roles"
                                        className={`${s.mobileSubLink} ${isActive('/admin/roles') ? s.mobileLinkActive : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Role Management
                                    </Link>
                                    <Link
                                        to="/admin/politics/upload"
                                        className={`${s.mobileSubLink} ${isActive('/admin/politics/upload') ? s.mobileLinkActive : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Politics Upload
                                    </Link>
                                </>
                            )}
                            {!isAdminUser && canEditPolitics && (
                                <Link
                                    to="/admin/politics/upload"
                                    className={`${s.mobileLink} ${isActive('/admin/politics/upload') ? s.mobileLinkActive : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <FileText size={20} style={{ marginRight: 8 }} />
                                    <span>Politics Upload</span>
                                </Link>
                            )}
                            {user && (
                                <Link 
                                    to="/profile"
                                    className={s.mobileLink}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span>My Profile</span>
                                </Link>
                            )}
                        </nav>
                        <div className={s.mobileActions}>
                            {user ? (
                                <button
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                    className={s.mobileLogout}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className={s.loginButton}>
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