import React from 'react';
import { Book, FileText, BookOpen,
    Newspaper, GraduationCap, HelpCircle, BookMarked, FlaskConical, LineChart,
    Users, Bot, Terminal, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import hammerAndSickleImage from './assets/hammerandsickle.png';
import { Analytics } from '@vercel/analytics/react';
import * as s from './App.css.ts';

const App = () => {
    const { user } = useAuth();

    const primaryCta = user
        ? { to: '/theory', label: 'Explore Theory' }
        : { to: '/digital-library', label: 'Browse Library' };

    const secondaryCta = user
        ? { to: '/submit', label: 'Submit Work' }
        : { to: '/forum', label: 'Enter Forum' };

    return (
        <div className={s.page}>
            <Analytics />
            <div className={s.hero}>
                <div className={s.heroGrid} />
                <div className={s.heroImageWrap}>
                    <img src={hammerAndSickleImage} alt="Background" className={s.heroImage} />
                </div>

                <div className={s.heroContent}>
                    <div className={s.heroCopy}>
                        <h1 className={s.heroTitle}>Advancing Revolutionary Theory</h1>
                        <p className={s.heroSubtitle}>
                            A platform for the new generation of Marxist theorists and researchers.
                        </p>
                        <div className={s.heroCtas}>
                            <Link to={primaryCta.to} className={s.ctaPrimary}>
                                {primaryCta.label}
                            </Link>
                            <Link to={secondaryCta.to} className={s.ctaSecondary}>
                                {secondaryCta.label}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <section className={s.aboutSection}>
                <div className={s.aboutInner}>
                    <h2 className={s.aboutTitle}>About Our Collective</h2>
                    <p className={s.aboutText}>
                        We are a collective of researchers, theorists, and activists dedicated to advancing Marxist theory and practice in the contemporary world. Our platform serves as a hub for critical analysis, theoretical development, and revolutionary scholarship.
                    </p>
                    <div className={s.aboutGrid}>
                        <div className={s.aboutCard}>
                            <div className={s.aboutIconFrame}>
                                <Book size={24} />
                            </div>
                            <div>
                                <h3 className={s.aboutCardTitle}>Research Focus</h3>
                                <p className={s.aboutCardText}>Conducting rigorous theoretical research and analysis of contemporary social, economic, and political phenomena through a Marxist lens.</p>
                            </div>
                        </div>
                        <div className={s.aboutCard}>
                            <div className={s.aboutIconFrame}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className={s.aboutCardTitle}>Publication Platform</h3>
                                <p className={s.aboutCardText}>Providing a platform for revolutionary scholars to publish and share their research, analyses, and theoretical contributions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coming Soon — Members-Only Features (guest view only) */}
            {!user && (
                <section className={s.guestSection}>
                    <div className={s.guestInner}>
                        <div className={s.guestHeader}>
                            <span className={s.guestBadge}>
                                <Lock size={14} />
                                Members Only
                            </span>
                            <h2 className={s.guestTitle}>Coming Soon for Members</h2>
                            <p className={s.guestSubtitle}>
                                Register to unlock the full platform. Here's what awaits inside.
                            </p>
                        </div>

                        <div className={s.guestGrid}>
                            {[
                                { icon: Newspaper, title: 'Politics', desc: 'A newspaper-style feed of political dispatches, analysis, and commentary on current events through a Marxist lens.' },
                                { icon: GraduationCap, title: 'Study Center', desc: 'Structured learning paths, curated reading lists, and milestone tracking for systematic Marxist education.' },
                                { icon: BookMarked, title: 'Revolutionary Theory', desc: 'Browse and read in-depth theory articles with advanced analysis tools and reading modes.' },
                                { icon: HelpCircle, title: 'Knowledge Q&A', desc: 'Ask questions, get answers, and build a collaborative knowledge base on Marxist theory and practice.' },
                                { icon: BookOpen, title: 'Glossary', desc: 'A self-contained wiki of Marxist concepts, terms, and definitions — all interconnected and searchable.' },
                                { icon: FlaskConical, title: 'Science & Tech', desc: 'Courses and textbooks spanning natural sciences, mathematics, and technology — because communists should know everything.' },
                                { icon: LineChart, title: 'Data & Visualizations', desc: 'Track global economic developments and class-struggle metrics through interactive data visualizations.' },
                                { icon: Users, title: 'Member Directory', desc: 'Connect with fellow researchers, theorists, and activists building revolutionary understanding together.' },
                                { icon: Terminal, title: 'World Sim', desc: 'An immersive historical-materialist simulation where you organize, strategize, and shape revolutionary history.' },
                                { icon: Bot, title: 'MarxBot', desc: 'An AI assistant trained on Marxist theory to help with research, analysis, and theoretical questions.' },
                            ].map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={i} className={s.featureCard}>
                                        <div className={s.featureRow}>
                                            <div className={s.featureIconFrame}>
                                                <Icon size={18} />
                                            </div>
                                            <div className={s.featureBody}>
                                                <div className={s.featureHeader}>
                                                    <h3 className={s.featureTitle}>{feature.title}</h3>
                                                    <span className={s.featureTag}>Coming Soon</span>
                                                </div>
                                                <p className={s.featureDesc}>{feature.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={s.guestCta}>
                            <Link to="/login" className={s.ctaPrimary}>
                                Register to Unlock
                                <Lock size={16} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;