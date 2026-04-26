import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, BookMarked, GraduationCap, FlaskConical, LineChart, Users, MessageSquare, HelpCircle, Newspaper } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as s from './ComingSoonPage.css.ts';

const FEATURE_CONFIG = {
    theory: {
        icon: BookMarked,
        title: 'Revolutionary Theory',
        desc: 'Browse and read in-depth theory articles with advanced analysis tools and reading modes.',
    },
    study: {
        icon: GraduationCap,
        title: 'Study Center',
        desc: 'Structured learning paths, curated reading lists, and milestone tracking for systematic Marxist education.',
    },
    'science-tech': {
        icon: FlaskConical,
        title: 'Science & Technology',
        desc: 'Courses and textbooks spanning natural sciences, mathematics, and technology — because communists should know everything.',
    },
    visualizations: {
        icon: LineChart,
        title: 'Data & Visualizations',
        desc: 'Track global economic developments and class-struggle metrics through interactive data visualizations.',
    },
    directory: {
        icon: Users,
        title: 'Member Directory',
        desc: 'Connect with fellow researchers, theorists, and activists building revolutionary understanding together.',
    },
    forum: {
        icon: MessageSquare,
        title: 'Discussion Forum',
        desc: 'Engage in theoretical discussions, debates, and collaborative analysis with the community.',
    },
    knowledge: {
        icon: HelpCircle,
        title: 'Knowledge Q&A',
        desc: 'Ask questions and build a collaborative knowledge base on Marxist theory and practice.',
    },
    politics: {
        icon: Newspaper,
        title: 'Politics',
        desc: 'A newspaper-style feed of political dispatches, analysis, and commentary on current events through a Marxist lens.',
    },
};

const CLASS_DATA = [
    { name: 'Working Class', value: 60, color: '#c81e1e' },
    { name: 'Middle Class', value: 30, color: '#ffb800' },
    { name: 'Capitalist Class', value: 10, color: '#2ed573' },
];

const GINI_DATA = [
    { year: '1980', gini: 0.30 },
    { year: '1985', gini: 0.33 },
    { year: '1990', gini: 0.35 },
    { year: '1995', gini: 0.38 },
    { year: '2000', gini: 0.39 },
    { year: '2005', gini: 0.40 },
    { year: '2010', gini: 0.42 },
    { year: '2015', gini: 0.43 },
    { year: '2020', gini: 0.45 },
];

const VisualizationTeaser = () => (
    <div className={s.teaserSection}>
        <div className={s.teaserGrid}>
            <div className={s.teaserCard}>
                <div className={s.teaserOverlay}>
                    <span className={s.teaserOverlayText}>Sign in to explore the full dashboard</span>
                    <Link to="/login" className={s.teaserOverlayCta}>
                        <Lock size={14} />
                        Register
                    </Link>
                </div>
                <div className={s.teaserLabel}>Class Composition</div>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={CLASS_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                            {CLASS_DATA.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className={s.teaserCard}>
                <div className={s.teaserOverlay}>
                    <span className={s.teaserOverlayText}>Sign in to explore the full dashboard</span>
                    <Link to="/login" className={s.teaserOverlayCta}>
                        <Lock size={14} />
                        Register
                    </Link>
                </div>
                <div className={s.teaserLabel}>Inequality Trend (Gini Index)</div>
                <ResponsiveContainer width="100%" height={200}>
                    <ReLineChart data={GINI_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="year" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0.25, 0.50]} tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Line type="monotone" dataKey="gini" stroke="#c81e1e" strokeWidth={2} dot={{ fill: '#c81e1e', r: 3 }} />
                        <Tooltip contentStyle={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                    </ReLineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

const ComingSoonPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const featureKey = searchParams.get('feature');
    const feature = FEATURE_CONFIG[featureKey];
    const FeatureIcon = feature?.icon;

    return (
        <div className={s.page}>
            <div className={s.inner}>
                {feature && (
                    <div className={s.featureIconFrame}>
                        <FeatureIcon size={28} />
                    </div>
                )}

                <h1 className={s.title}>{feature ? feature.title : 'Coming Soon'}</h1>
                <div className={s.rule} />

                <p className={s.subtitle}>
                    {feature ? feature.desc : 'This section is under active development and will be available soon.'}
                </p>

                {featureKey === 'visualizations' && <VisualizationTeaser />}

                {!feature && (
                    <div className={s.card}>
                        <h2 className={s.cardTitle}>What to expect</h2>
                        <p className={s.cardText}>
                            I'm working on a revolutionary platform for Marxist theory, education, and analysis. 
                            I am building a comprehensive library of resources, interactive study tools, 
                            and collaborative research features.
                        </p>
                        <p className={s.cardText}>
                            Check back soon or sign up for updates to be notified when this feature launches.
                        </p>
                    </div>
                )}

                {feature && (
                    <Link to="/login" className={s.registerCta}>
                        <Lock size={16} />
                        Register to Unlock
                    </Link>
                )}

                <button onClick={() => navigate('/')} className={s.backButton}>
                    <ArrowLeft size={16} />
                    Return to Homepage
                </button>
            </div>
        </div>
    );
};

export default ComingSoonPage;
