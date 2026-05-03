import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { 
    BookOpen, MessageSquare, LogIn, UserPlus, 
    Mail, ArrowRight, CheckCircle, AlertTriangle, Loader2,
    X, Eye, Sparkles, ExternalLink, Heart,
    GraduationCap, FlaskConical, BarChart3, PenTool,
    Layers
} from 'lucide-react';
import MarxBg from '../assets/Marx.jpg';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { login, signUp } = useAuth();
    
    // Modal states
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);

    // Login modal is now only opened by explicit user click on "Log In" buttons
    
    // Login form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    
    // Register form
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        inviteCode: '',
        betaReason: ''
    });
    const [registerError, setRegisterError] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [hasInviteCode, setHasInviteCode] = useState(false);
    
    // Email signup (waitlist)
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistLoading, setWaitlistLoading] = useState(false);
    const [waitlistSuccess, setWaitlistSuccess] = useState(false);
    const [waitlistError, setWaitlistError] = useState('');
    const [notifyInvites, setNotifyInvites] = useState(true);
    const [notifyBeta, setNotifyBeta] = useState(true);

    // View mode toggle
    const [viewMode, setViewMode] = useState('normal');

    // Mouse tracking state (cinematic view)
    const rootRef = useRef(null);
    const revealRef = useRef(null);
    const bgTopRef = useRef(null);
    const gridRef = useRef(null);
    const mousePos = useRef({ x: -300, y: -300 });
    const prevMousePos = useRef({ x: -300, y: -300 });
    const animFrameRef = useRef(null);
    const echoContainerRef = useRef(null);
    const highlightableRefs = useRef([]);
    const parallaxRefs = useRef([]);
    const titleRef = useRef(null);

    const registerHighlightable = useCallback((el) => {
        if (el && !highlightableRefs.current.includes(el)) {
            highlightableRefs.current.push(el);
        }
    }, []);

    const registerParallax = useCallback((el) => {
        if (el && !parallaxRefs.current.includes(el)) {
            parallaxRefs.current.push(el);
        }
    }, []);

    // Mouse tracking + reveal + echo + highlight + parallax (cinematic view)
    useEffect(() => {
        if (viewMode !== 'cinematic') return;

        const root = rootRef.current;
        const reveal = revealRef.current;
        const bgTop = bgTopRef.current;
        const grid = gridRef.current;
        const echoContainer = echoContainerRef.current;
        if (!root || !reveal) return;

        let lastEchoTime = 0;

        const handleMouseMove = (e) => {
            prevMousePos.current = { ...mousePos.current };
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        const tick = () => {
            const { x, y } = mousePos.current;
            const prev = prevMousePos.current;

            reveal.style.setProperty('--mouse-x', `${x}px`);
            reveal.style.setProperty('--mouse-y', `${y}px`);
            if (bgTop) {
                bgTop.style.setProperty('--mouse-x', `${x}px`);
                bgTop.style.setProperty('--mouse-y', `${y}px`);
            }

            if (grid) {
                const cx = window.innerWidth / 2;
                const cy = window.innerHeight / 2;
                grid.style.setProperty('--grid-x', `${(x - cx) * 0.02}`);
                grid.style.setProperty('--grid-y', `${(y - cy) * 0.02}`);
            }

            const dx = x - prev.x;
            const dy = y - prev.y;
            const velocity = Math.sqrt(dx * dx + dy * dy);
            const now = Date.now();

            if (velocity > 8 && now - lastEchoTime > 50 && echoContainer) {
                lastEchoTime = now;
                const echo = document.createElement('div');
                echo.className = 'landing-echo';
                echo.innerHTML = '<span style="color:#991b1b">Marxist</span><span style="color:#fff">.info</span>';
                echo.style.maskImage = `radial-gradient(circle 160px at ${x}px ${y}px, rgba(0,0,0,0.6) 0%, transparent 70%)`;
                echo.style.webkitMaskImage = echo.style.maskImage;
                echoContainer.appendChild(echo);
                setTimeout(() => {
                    if (echo.parentNode) echo.parentNode.removeChild(echo);
                }, 650);
            }

            const spotRadius = 200;
            if (titleRef.current) {
                const tRect = titleRef.current.getBoundingClientRect();
                const tCx = tRect.left + tRect.width / 2;
                const tCy = tRect.top + tRect.height / 2;
                const tDist = Math.sqrt((x - tCx) ** 2 + (y - tCy) ** 2);
                const tThreshold = spotRadius + Math.max(tRect.width, tRect.height) / 2;
                if (tDist < tThreshold) {
                    titleRef.current.classList.add('title-revealed');
                } else {
                    titleRef.current.classList.remove('title-revealed');
                }
            }

            highlightableRefs.current.forEach((el) => {
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const elCx = rect.left + rect.width / 2;
                const elCy = rect.top + rect.height / 2;
                const dist = Math.sqrt((x - elCx) ** 2 + (y - elCy) ** 2);
                const threshold = spotRadius + Math.max(rect.width, rect.height) / 2;
                if (dist < threshold) {
                    el.classList.add('highlighted');
                } else {
                    el.classList.remove('highlighted');
                }
            });

            const cx2 = window.innerWidth / 2;
            const cy2 = window.innerHeight / 2;
            parallaxRefs.current.forEach((el) => {
                if (!el) return;
                const factor = parseFloat(el.dataset.parallax || '0.015');
                const tx = -(x - cx2) * factor;
                const ty = -(y - cy2) * factor;
                el.style.transform = `translate(${tx}px, ${ty}px)`;
            });

            animFrameRef.current = requestAnimationFrame(tick);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animFrameRef.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [viewMode]);

    // Feature card data (cinematic view)
    const features = [
        { icon: GraduationCap, title: 'Study Page', desc: 'A structured learning environment featuring curated reading lists, study guides, and theoretical discussions to develop Marxist understanding systematically.' },
        { icon: FlaskConical, title: 'Science & Technology', desc: 'As Lenin emphasized, communists should know everything mankind has to offer. Dedicated to ensuring Marxists are thoroughly educated in natural sciences and all fields of human knowledge.' },
        { icon: BookOpen, title: 'Digital Library', desc: 'An expanding collection of essential Marxist texts, articles, and analyses, organized and annotated for accessibility and theoretical development.' },
        { icon: BarChart3, title: 'Data & Visualizations', desc: 'Tools for tracking global economic developments and staying updated on the evolving conditions of capitalist production and class struggle.' },
        { icon: PenTool, title: "Writers' Collective", desc: 'A collaborative space for developing revolutionary thinkers and writers, emphasizing quality theoretical work that contributes to the Marxist tradition.' },
        { icon: MessageSquare, title: 'Discussion Forum', desc: 'Engage in theoretical discussions with fellow researchers, theorists, and activists building revolutionary understanding.' },
    ];

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const result = await login({ email: loginEmail, password: loginPassword });

            if (result.error) {
                setLoginError(result.error.message);
            } else {
                setShowLoginModal(false);
                navigate('/home');
            }
        } catch (err) {
            setLoginError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError('');
        
        if (registerData.password !== registerData.confirmPassword) {
            setRegisterError('Passwords do not match');
            return;
        }
        
        if (registerData.username.length < 3) {
            setRegisterError('Username must be at least 3 characters');
            return;
        }

        setRegisterLoading(true);
        
        // Pre-validate invite code via secure RPC before signup
        if (hasInviteCode && registerData.inviteCode) {
            const { data: validation, error: valError } = await supabase.rpc('validate_invite_code', {
                p_code: registerData.inviteCode
            });
            if (valError || !validation?.valid) {
                setRegisterError('Invalid or already used invite code');
                setRegisterLoading(false);
                return;
            }
        }

        const result = await signUp({
            email: registerData.email,
            password: registerData.password,
            username: registerData.username,
            inviteCode: hasInviteCode ? registerData.inviteCode : null,
            betaReason: !hasInviteCode ? registerData.betaReason : null
        });
        
        if (result.error) {
            setRegisterError(result.error.message);
        } else {
            setRegisterSuccess(true);
        }
        setRegisterLoading(false);
    };

    const handleWaitlistSignup = async (e) => {
        e.preventDefault();
        setWaitlistError('');
        setWaitlistLoading(true);
        
        try {
            const { data, error } = await supabase.functions.invoke('waitlist-signup', {
                body: {
                    email: waitlistEmail,
                    notify_invite_codes: notifyInvites,
                    notify_public_beta: notifyBeta,
                },
            });

            if (error) {
                setWaitlistError('Failed to join. Please try again.');
            } else if (data?.error) {
                if (data.error.includes('already on the list')) {
                    setWaitlistError('This email is already on the list.');
                } else {
                    setWaitlistError(data.error);
                }
            } else {
                setWaitlistSuccess(true);
            }
        } catch (err) {
            setWaitlistError('Failed to join. Please try again.');
        }
        setWaitlistLoading(false);
    };

    const handleGuestAccess = () => {
        navigate('/home');
    };

    // Toggle button (shared across both views)
    const toggleButton = (
        <button
            onClick={() => setViewMode(v => v === 'cinematic' ? 'normal' : 'cinematic')}
            className="fixed top-4 left-4 z-[200] flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-700/80 transition text-sm font-medium"
            title={viewMode === 'cinematic' ? 'Switch to Normal View' : 'Switch to Cinematic View'}
        >
            <Layers size={16} />
            {viewMode === 'cinematic' ? 'Normal View' : 'Cinematic View'}
        </button>
    );

    // ===== CINEMATIC VIEW =====
    if (viewMode === 'cinematic') {
        return (
            <div className="landing-root" ref={rootRef}>
                {toggleButton}

                {/* Background layers */}
                <div className="landing-bg-top" ref={bgTopRef} style={{ backgroundImage: 'url(/marx-background.png)' }} />

                {/* Hidden text layer — revealed by cursor spotlight */}
                <div className="landing-reveal-layer landing-reveal-text" ref={revealRef}>
                    <span className="landing-reveal-red">Marxist</span>
                    <span className="landing-reveal-white">.info</span>
                </div>
                <div ref={echoContainerRef} style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }} />
                <div className="landing-grid" ref={gridRef} />

                {/* ===== Content ===== */}
                <div className="landing-content">

                    {/* Hero Section */}
                    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
                        <div className="landing-parallax" data-parallax="0.02" ref={registerParallax}>
                            <h1 
                                className="landing-title-content text-6xl md:text-8xl font-extrabold mb-5 tracking-tight"
                                ref={titleRef}
                            >
                                <span 
                                    className="landing-title-red landing-highlightable" 
                                    ref={registerHighlightable}
                                >
                                    Marxist
                                </span>
                                <span 
                                    className="landing-title-white landing-highlightable" 
                                    ref={registerHighlightable}
                                >
                                    .info
                                </span>
                            </h1>

                            <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                                A platform for the new generation<br />of Marxist theorists and researchers
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mb-6">
                                <button
                                    onClick={handleGuestAccess}
                                    className="btn-secondary landing-highlightable flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
                                    ref={registerHighlightable}
                                >
                                    <Eye size={20} />
                                    Browse as Guest
                                </button>
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="btn-primary-red landing-highlightable flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
                                    ref={registerHighlightable}
                                >
                                    <LogIn size={20} />
                                    Log In
                                </button>
                                <button
                                    onClick={() => setShowRegisterModal(true)}
                                    className="btn-outlined-red landing-highlightable flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
                                    ref={registerHighlightable}
                                >
                                    <UserPlus size={20} />
                                    Register
                                </button>
                            </div>
                            <button
                                onClick={() => setShowAboutModal(true)}
                                className="landing-highlightable text-gray-500 hover:text-white transition text-sm font-medium tracking-wide"
                                ref={registerHighlightable}
                            >
                                About the Project
                            </button>
                        </div>
                    </section>

                    {/* The Vision */}
                    <section className="max-w-3xl mx-auto px-4 pb-24">
                        <div className="landing-parallax glass-card p-8 md:p-10" data-parallax="0.01" ref={registerParallax}>
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">The Vision</h2>
                            <p className="text-gray-300 mb-5 leading-relaxed">
                                I am Leninistwarrior, as many know me across various platforms. Since November, I have been 
                                dedicated to creating this platform with a singular vision: to revitalize authentic Marxist 
                                analysis and provide a hub for writers with revolutionary potential.
                            </p>
                            <p className="text-gray-300 mb-5 leading-relaxed">
                                In the latter part of the century, Marxism has been neglected and perverted beyond recognition. This site 
                                aims to correct this trajectory by returning to scientific principles while addressing 
                                contemporary conditions.
                            </p>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                This site will primarily function as a writers' collective and community hub. As time progresses
                                and our means increase, the digital library will be filled with essential texts and analysis.
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <a 
                                    href="https://x.com/Leninistwarrior" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="landing-highlightable flex items-center gap-2 text-red-400 hover:text-red-300 transition font-medium"
                                    ref={registerHighlightable}
                                >
                                    <ExternalLink size={16} />
                                    @Leninistwarrior on Twitter
                                </a>
                                <span className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-500 border border-gray-700 cursor-default">
                                    <Heart size={18} />
                                    Donations coming soon
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Platform Features */}
                    <section className="max-w-6xl mx-auto px-4 pb-24">
                        <div className="landing-parallax" data-parallax="0.008" ref={registerParallax}>
                            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white">Platform Features</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {features.map((f, i) => {
                                    const Icon = f.icon;
                                    return (
                                        <div key={i} className="glass-card-feature p-6">
                                            <Icon className="text-red-700 mb-4" size={32} />
                                            <h3 className="text-xl font-bold mb-2 text-white">{f.title}</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Stay Updated */}
                    <section className="max-w-xl mx-auto px-4 pb-24">
                        <div className="landing-parallax glass-card p-8" data-parallax="0.01" ref={registerParallax}>
                            <div className="flex items-center gap-2 mb-4">
                                <Mail className="text-red-700" size={24} />
                                <h2 className="text-2xl font-bold text-white">Stay Updated</h2>
                            </div>
                            <p className="text-gray-400 mb-6">
                                Join our notification list to be informed when new invite codes are available or when we launch public beta.
                            </p>
                            
                            {waitlistSuccess ? (
                                <div className="text-center py-4">
                                    <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                                    <p className="text-green-400 font-semibold">You're on the list!</p>
                                    <p className="text-gray-400 text-sm">We'll notify you when spots open up.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleWaitlistSignup} className="space-y-4">
                                    <input
                                        type="email"
                                        value={waitlistEmail}
                                        onChange={(e) => setWaitlistEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-red-800 focus:outline-none text-white placeholder-gray-500"
                                        required
                                    />
                                    <div className="flex flex-col gap-2 text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifyInvites}
                                                onChange={(e) => setNotifyInvites(e.target.checked)}
                                                className="accent-red-800"
                                            />
                                            <span className="text-gray-300">Notify me when invite codes are available</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifyBeta}
                                                onChange={(e) => setNotifyBeta(e.target.checked)}
                                                className="accent-red-800"
                                            />
                                            <span className="text-gray-300">Notify me when public beta launches</span>
                                        </label>
                                    </div>
                                    {waitlistError && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertTriangle size={14} /> {waitlistError}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={waitlistLoading}
                                        className="w-full p-3 btn-primary-red rounded-lg font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {waitlistLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                        {waitlistLoading ? 'Joining...' : 'Join Notification List'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t border-gray-800/50 py-8">
                        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
                            <p>&copy; 2026 Marxist.info &mdash; Advancing Revolutionary Theory</p>
                        </div>
                    </footer>
                </div>

                {/* ===== CINEMATIC MODALS ===== */}

                {/* Login Modal */}
                {showLoginModal && (
                    <div className="modal-backdrop">
                        <div className="modal-panel">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Log In</h2>
                                <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-white transition">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="w-full p-3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full p-3"
                                        required
                                    />
                                </div>
                                {loginError && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-red-500 text-sm">
                                        <p className="flex min-w-0 flex-1 items-start gap-1">
                                            <AlertTriangle className="mt-0.5 shrink-0" size={14} /> {loginError}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleLogin}
                                            disabled={loginLoading}
                                            className="shrink-0 rounded border border-red-500/50 px-3 py-1 font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loginLoading}
                                    className="modal-btn-primary w-full p-3 flex items-center justify-center gap-2"
                                >
                                    {loginLoading && <Loader2 className="animate-spin" size={20} />}
                                    {loginLoading ? 'Logging in...' : 'Log In'}
                                </button>
                            </form>
                            <p className="text-center text-gray-500 mt-4 text-sm">
                                Don't have an account?{' '}
                                <button 
                                    onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
                                    className="text-red-500 hover:underline"
                                >
                                    Register
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {/* Register Modal */}
                {showRegisterModal && (
                    <div className="modal-backdrop">
                        <div className="modal-panel">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                                <button onClick={() => { setShowRegisterModal(false); setRegisterSuccess(false); }} className="text-gray-400 hover:text-white transition">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            {registerSuccess ? (
                                <div className="text-center py-8">
                                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2 text-white">Check Your Email</h3>
                                    <p className="text-gray-300 mb-4">
                                        We've sent a confirmation link to <span className="text-red-500">{registerData.email}</span>
                                    </p>
                                    {hasInviteCode ? (
                                        <p className="text-green-400 text-sm">
                                            <Sparkles size={16} className="inline mr-1" />
                                            Your invite code will be applied after email confirmation.
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 text-sm">
                                            You'll be added to the waitlist. We'll notify you when spots open up.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-lg mb-4 border border-gray-700/50">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasInviteCode}
                                                onChange={(e) => setHasInviteCode(e.target.checked)}
                                                className="accent-red-800"
                                            />
                                            <span className="font-medium text-white">I have an invite code</span>
                                        </label>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Invite codes grant immediate full access (limited to 50 spots)
                                        </p>
                                    </div>

                                    {hasInviteCode && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-1">
                                                <Sparkles size={14} className="text-yellow-500" /> Invite Code
                                            </label>
                                            <input
                                                type="text"
                                                value={registerData.inviteCode}
                                                onChange={(e) => setRegisterData({...registerData, inviteCode: e.target.value.toUpperCase()})}
                                                className="w-full p-3 uppercase tracking-wider"
                                                style={{ borderColor: 'rgba(202,138,4,0.5)' }}
                                                placeholder="XXXX-XXXX"
                                                required={hasInviteCode}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
                                        <input
                                            type="text"
                                            value={registerData.username}
                                            onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                            className="w-full p-3"
                                            placeholder="Min. 3 characters"
                                            minLength={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                                        <input
                                            type="email"
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                            className="w-full p-3"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                                        <input
                                            type="password"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                            className="w-full p-3"
                                            placeholder="Min. 6 characters"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={registerData.confirmPassword}
                                            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                            className="w-full p-3"
                                            required
                                        />
                                    </div>

                                    {!hasInviteCode && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                                Why should you be a beta user? <span className="text-gray-500 font-normal">(optional)</span>
                                            </label>
                                            <textarea
                                                value={registerData.betaReason}
                                                onChange={(e) => setRegisterData({...registerData, betaReason: e.target.value})}
                                                className="w-full p-3 text-sm resize-none"
                                                rows={3}
                                                maxLength={500}
                                                placeholder="Tell us briefly about your interest in Marxist theory..."
                                            />
                                        </div>
                                    )}
                                    
                                    {registerError && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertTriangle size={14} /> {registerError}
                                        </p>
                                    )}
                                    
                                    <button
                                        type="submit"
                                        disabled={registerLoading}
                                        className="modal-btn-primary w-full p-3 flex items-center justify-center gap-2"
                                    >
                                        {registerLoading && <Loader2 className="animate-spin" size={20} />}
                                        {registerLoading ? 'Creating Account...' : hasInviteCode ? 'Register with Invite Code' : 'Join Waitlist'}
                                    </button>
                                    
                                    {!hasInviteCode && (
                                        <p className="text-gray-500 text-xs text-center">
                                            Without an invite code, you'll be added to our waitlist and notified when spots open.
                                        </p>
                                    )}
                                </form>
                            )}
                            
                            <p className="text-center text-gray-500 mt-4 text-sm">
                                Already have an account?{' '}
                                <button 
                                    onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
                                    className="text-red-500 hover:underline"
                                >
                                    Log In
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {/* About Modal */}
                {showAboutModal && (
                    <div className="modal-backdrop">
                        <div className="modal-panel modal-panel-wide">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">About Marxist.info</h2>
                                <button onClick={() => setShowAboutModal(false)} className="text-gray-400 hover:text-white transition">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="max-w-none">
                                <p className="text-gray-300 mb-5 leading-relaxed">
                                    Marxist.info is a digital platform dedicated to advancing Marxist theory and research in the 21st century. 
                                    Our mission is to provide a comprehensive resource for scholars, students, and activists interested in 
                                    understanding and applying Marxist analysis to contemporary issues.
                                </p>
                                
                                <h3 className="text-xl font-semibold text-white mt-6 mb-3">What We Offer</h3>
                                <ul className="text-gray-300 space-y-2 list-disc list-inside mb-4">
                                    <li>A curated digital library of classic and contemporary Marxist texts</li>
                                    <li>Interactive timelines of historical events and theoretical developments</li>
                                    <li>A glossary of key concepts and terminology</li>
                                    <li>Discussion forums for theoretical debate and collaboration</li>
                                    <li>Study tools and resources for individual and group learning</li>
                                </ul>
                                
                                <h3 className="text-xl font-semibold text-white mt-6 mb-3">Early Access</h3>
                                <p className="text-gray-300 mb-4 leading-relaxed">
                                    We're currently in early access with limited spots available. Users with invite codes get 
                                    immediate full access, while others can join our waitlist to be notified when more spots 
                                    open up or when we launch public beta.
                                </p>
                                
                                <h3 className="text-xl font-semibold text-white mt-6 mb-3">Guest Access</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    You can browse the Home page and Digital Library as a guest without an account.
                                    Full features like Theory, Study tools, Forum, and Profile require registration with an invite code.
                                </p>
                            </div>
                            
                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => { setShowAboutModal(false); setShowRegisterModal(true); }}
                                    className="modal-btn-primary flex-1 p-3"
                                >
                                    Register Now
                                </button>
                                <button
                                    onClick={() => setShowAboutModal(false)}
                                    className="modal-btn-ghost px-6 py-3"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ===== NORMAL VIEW (existing landing page) =====
    return (
        <div className="min-h-screen text-white" style={{ background: '#090909' }}>
            {toggleButton}
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${MarxBg})` }}></div>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(9,9,9,0.5), #090909)' }}></div>
                
                <div className="relative max-w-6xl mx-auto px-4 py-20">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="text-red-800">Marxist</span>.info
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
                            A platform for the new generation of Marxist theorists and researchers
                        </p>
                        
                        {/* Main Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            <button
                                onClick={handleGuestAccess}
                                className="modal-btn-ghost flex items-center gap-2 px-6 py-3"
                            >
                                <Eye size={20} />
                                Browse as Guest
                            </button>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="modal-btn-primary flex items-center gap-2 px-6 py-3"
                            >
                                <LogIn size={20} />
                                Log In
                            </button>
                            <button
                                onClick={() => setShowRegisterModal(true)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition" style={{ border: '1px solid rgba(200,30,30,0.28)', background: 'transparent', color: '#fff' }}
                            >
                                <UserPlus size={20} />
                                Register
                            </button>
                            <button
                                onClick={() => setShowAboutModal(true)}
                                className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition"
                            >
                                About the Project
                            </button>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="max-w-4xl mx-auto mb-16">
                        <div className="p-8 rounded-2xl" style={{ background: 'linear-gradient(180deg, #141414 0%, #0f0f0f 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 18px 40px rgba(0,0,0,0.42)' }}>
                            <h2 className="text-2xl font-bold mb-4">The Vision</h2>
                            <p className="text-gray-300 mb-4">
                                I am Leninistwarrior, as many know me across various platforms. Since November, I have been 
                                dedicated to creating this platform with a singular vision: to revitalize authentic Marxist 
                                analysis and provide a hub for writers with revolutionary potential.
                            </p>
                            <p className="text-gray-300 mb-4">
                                In the latter part of the century, Marxism has been neglected and perverted beyond recognition. This site 
                                aims to correct this trajectory by returning to scientific principles while addressing 
                                contemporary conditions.
                            </p>
                            <p className="text-gray-300 mb-6">
                                This site will primarily function as a writers' collective and community hub. As time progresses
                                and our means increase, the digital library will be filled with essential texts and analysis.
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <a 
                                    href="https://x.com/Leninistwarrior" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition font-medium"
                                >
                                    <ExternalLink size={16} />
                                    @Leninistwarrior on Twitter
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Site Features */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Platform Features</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <GraduationCap className="text-red-800 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Study Page</h3>
                                <p className="text-gray-400">A structured learning environment featuring curated reading lists, study guides, and theoretical discussions to develop Marxist understanding systematically.</p>
                            </div>
                            <div className="p-6 rounded-xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <FlaskConical className="text-red-800 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Science & Technology</h3>
                                <p className="text-gray-400">As Lenin emphasized, communists should know everything mankind has to offer. Dedicated to ensuring Marxists are thoroughly educated in natural sciences and all fields of human knowledge.</p>
                            </div>
                            <div className="p-6 rounded-xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <BookOpen className="text-red-800 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Digital Library</h3>
                                <p className="text-gray-400">An expanding collection of essential Marxist texts, articles, and analyses, organized and annotated for accessibility and theoretical development.</p>
                            </div>
                            <div className="p-6 rounded-xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <BarChart3 className="text-red-800 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Data & Visualizations</h3>
                                <p className="text-gray-400">Tools for tracking global economic developments and staying updated on the evolving conditions of capitalist production and class struggle.</p>
                            </div>
                            <div className="p-6 rounded-xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <PenTool className="text-red-800 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Writers' Collective</h3>
                                <p className="text-gray-400">A collaborative space for developing revolutionary thinkers and writers, emphasizing quality theoretical work that contributes to the Marxist tradition.</p>
                            </div>
                            <div className="p-6 rounded-xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <MessageSquare className="text-red-800 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Discussion Forum</h3>
                                <p className="text-gray-400">Engage in theoretical discussions with fellow researchers, theorists, and activists building revolutionary understanding.</p>
                            </div>
                        </div>
                    </div>

                    {/* Email Signup Section */}
                    <div className="max-w-xl mx-auto p-8 rounded-2xl" style={{ background: 'linear-gradient(180deg, #141414 0%, #0f0f0f 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 18px 40px rgba(0,0,0,0.42)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="text-red-800" size={24} />
                            <h2 className="text-2xl font-bold">Stay Updated</h2>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Join our notification list to be informed when new invite codes are available or when we launch public beta.
                        </p>
                        
                        {waitlistSuccess ? (
                            <div className="text-center py-4">
                                <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                                <p className="text-green-400 font-semibold">You're on the list!</p>
                                <p className="text-gray-400 text-sm">We'll notify you when spots open up.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleWaitlistSignup} className="space-y-4">
                                <input
                                    type="email"
                                    value={waitlistEmail}
                                    onChange={(e) => setWaitlistEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full p-3 rounded-xl focus:outline-none"
                                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', color: '#fff' }}
                                    required
                                />
                                <div className="flex flex-col gap-2 text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifyInvites}
                                            onChange={(e) => setNotifyInvites(e.target.checked)}
                                            className="accent-red-800"
                                        />
                                        <span className="text-gray-300">Notify me when invite codes are available</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifyBeta}
                                            onChange={(e) => setNotifyBeta(e.target.checked)}
                                            className="accent-red-800"
                                        />
                                        <span className="text-gray-300">Notify me when public beta launches</span>
                                    </label>
                                </div>
                                {waitlistError && (
                                    <p className="text-red-600 text-sm flex items-center gap-1">
                                        <AlertTriangle size={14} /> {waitlistError}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={waitlistLoading}
                                    className="modal-btn-primary w-full p-3 flex items-center justify-center gap-2"
                                >
                                    {waitlistLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                    {waitlistLoading ? 'Joining...' : 'Join Notification List'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="modal-backdrop">
                    <div className="modal-panel">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Log In</h2>
                            <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    className="w-full p-3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="w-full p-3"
                                    required
                                />
                            </div>
                            {loginError && (
                                <div className="flex flex-wrap items-center justify-between gap-2 text-red-500 text-sm">
                                    <p className="flex min-w-0 flex-1 items-start gap-1">
                                        <AlertTriangle className="mt-0.5 shrink-0" size={14} /> {loginError}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleLogin}
                                        disabled={loginLoading}
                                        className="shrink-0 rounded border border-red-500/50 px-3 py-1 font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="modal-btn-primary w-full p-3 flex items-center justify-center gap-2"
                            >
                                {loginLoading && <Loader2 className="animate-spin" size={20} />}
                                {loginLoading ? 'Logging in...' : 'Log In'}
                            </button>
                        </form>
                        <p className="text-center text-gray-500 mt-4 text-sm">
                            Don't have an account?{' '}
                            <button 
                                onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
                                className="text-red-500 hover:underline"
                            >
                                Register
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* Register Modal */}
            {showRegisterModal && (
                <div className="modal-backdrop">
                    <div className="modal-panel">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Create Account</h2>
                            <button onClick={() => { setShowRegisterModal(false); setRegisterSuccess(false); }} className="text-gray-400 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {registerSuccess ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-white">Check Your Email</h3>
                                <p className="text-gray-300 mb-4">
                                    We've sent a confirmation link to <span className="text-red-500">{registerData.email}</span>
                                </p>
                                {hasInviteCode ? (
                                    <p className="text-green-400 text-sm">
                                        <Sparkles size={16} className="inline mr-1" />
                                        Your invite code will be applied after email confirmation.
                                    </p>
                                ) : (
                                    <p className="text-gray-400 text-sm">
                                        You'll be added to the waitlist. We'll notify you when spots open up.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-lg mb-4 border border-gray-700/50">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hasInviteCode}
                                            onChange={(e) => setHasInviteCode(e.target.checked)}
                                            className="accent-red-800"
                                        />
                                        <span className="font-medium text-white">I have an invite code</span>
                                    </label>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Invite codes grant immediate full access (limited to 50 spots)
                                    </p>
                                </div>

                                {hasInviteCode && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-1">
                                            <Sparkles size={14} className="text-yellow-500" /> Invite Code
                                        </label>
                                        <input
                                            type="text"
                                            value={registerData.inviteCode}
                                            onChange={(e) => setRegisterData({...registerData, inviteCode: e.target.value.toUpperCase()})}
                                            className="w-full p-3 uppercase tracking-wider"
                                            style={{ borderColor: 'rgba(202,138,4,0.5)' }}
                                            placeholder="XXXX-XXXX"
                                            required={hasInviteCode}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
                                    <input
                                        type="text"
                                        value={registerData.username}
                                        onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                        className="w-full p-3"
                                        placeholder="Min. 3 characters"
                                        minLength={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                        className="w-full p-3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                                    <input
                                        type="password"
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        className="w-full p-3"
                                        placeholder="Min. 6 characters"
                                        minLength={6}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={registerData.confirmPassword}
                                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                        className="w-full p-3"
                                        required
                                    />
                                </div>

                                {!hasInviteCode && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">
                                            Why should you be a beta user? <span className="text-gray-500 font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            value={registerData.betaReason}
                                            onChange={(e) => setRegisterData({...registerData, betaReason: e.target.value})}
                                            className="w-full p-3 text-sm resize-none"
                                            rows={3}
                                            maxLength={500}
                                            placeholder="Tell us briefly about your interest in Marxist theory..."
                                        />
                                    </div>
                                )}
                                
                                {registerError && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertTriangle size={14} /> {registerError}
                                    </p>
                                )}
                                
                                <button
                                    type="submit"
                                    disabled={registerLoading}
                                    className="modal-btn-primary w-full p-3 flex items-center justify-center gap-2"
                                >
                                    {registerLoading && <Loader2 className="animate-spin" size={20} />}
                                    {registerLoading ? 'Creating Account...' : hasInviteCode ? 'Register with Invite Code' : 'Join Waitlist'}
                                </button>
                                
                                {!hasInviteCode && (
                                    <p className="text-gray-500 text-xs text-center">
                                        Without an invite code, you'll be added to our waitlist and notified when spots open.
                                    </p>
                                )}
                            </form>
                        )}
                        
                        <p className="text-center text-gray-500 mt-4 text-sm">
                            Already have an account?{' '}
                            <button 
                                onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
                                className="text-red-500 hover:underline"
                            >
                                Log In
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* About Modal */}
            {showAboutModal && (
                <div className="modal-backdrop">
                    <div className="modal-panel modal-panel-wide">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">About Marxist.info</h2>
                            <button onClick={() => setShowAboutModal(false)} className="text-gray-400 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="max-w-none">
                            <p className="text-gray-300 mb-5 leading-relaxed">
                                Marxist.info is a digital platform dedicated to advancing Marxist theory and research in the 21st century. 
                                Our mission is to provide a comprehensive resource for scholars, students, and activists interested in 
                                understanding and applying Marxist analysis to contemporary issues.
                            </p>
                            
                            <h3 className="text-xl font-semibold text-white mt-6 mb-3">What We Offer</h3>
                            <ul className="text-gray-300 space-y-2 list-disc list-inside mb-4">
                                <li>A curated digital library of classic and contemporary Marxist texts</li>
                                <li>Interactive timelines of historical events and theoretical developments</li>
                                <li>A glossary of key concepts and terminology</li>
                                <li>Discussion forums for theoretical debate and collaboration</li>
                                <li>Study tools and resources for individual and group learning</li>
                            </ul>
                            
                            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Early Access</h3>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                We're currently in early access with limited spots available. Users with invite codes get 
                                immediate full access, while others can join our waitlist to be notified when more spots 
                                open up or when we launch public beta.
                            </p>
                            
                            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Guest Access</h3>
                            <p className="text-gray-300 leading-relaxed">
                                You can browse the Home page and Digital Library as a guest without an account.
                                Full features like Theory, Study tools, Forum, and Profile require registration with an invite code.
                            </p>
                        </div>
                        
                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => { setShowAboutModal(false); setShowRegisterModal(true); }}
                                className="modal-btn-primary flex-1 p-3"
                            >
                                Register Now
                            </button>
                            <button
                                onClick={() => setShowAboutModal(false)}
                                className="modal-btn-ghost px-6 py-3"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-6xl mx-auto px-4 text-center text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    <p>© 2026 Marxist.info — Advancing Revolutionary Theory</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
