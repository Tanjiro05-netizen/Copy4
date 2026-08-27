import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, BookMarked, GraduationCap, FlaskConical, LineChart, Users, MessageSquare, HelpCircle, Newspaper } from 'lucide-react';
import dynamic from 'next/dynamic';

/* recharts is code-split: the coming-soon screen must not ship a chart
   library. Markup lives, unchanged, in ComingSoonTeaser. */
const VisualizationTeaser = dynamic(() => import('../components/ComingSoonTeaser'), {
    ssr: false,
    loading: () => <div style={{ minHeight: 220 }} />,
});
import * as s from './ComingSoonPage.css.ts';

const FEATURE_CONFIG = {
    theory: {
        icon: BookMarked,
        title: 'Theory',
        desc: 'In-depth articles and texts with advanced reading tools. Available to members.',
    },
    study: {
        icon: GraduationCap,
        title: 'Study Center',
        desc: 'Structured learning paths, curated reading lists, and progress tracking. Available to members.',
    },
    'science-tech': {
        icon: FlaskConical,
        title: 'Science & Technology',
        desc: 'Courses and reference material spanning the natural sciences, mathematics, and technology. Available to members.',
    },
    visualizations: {
        icon: LineChart,
        title: 'Data & Visualizations',
        desc: 'Interactive charts and dashboards covering economic and social indicators. Available to members.',
    },
    directory: {
        icon: Users,
        title: 'Directory',
        desc: '',
    },
    forum: {
        icon: MessageSquare,
        title: 'Forum',
        desc: 'A space for discussion, debate, and collaborative reading. Available to members.',
    },
    knowledge: {
        icon: HelpCircle,
        title: 'Knowledge Base',
        desc: 'A community Q&A and reference resource. Available to members.',
    },
    politics: {
        icon: Newspaper,
        title: 'Politics',
        desc: 'News, analysis, and commentary on current events. Available to members.',
    },
};

const ComingSoonPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
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

                <p className={s.kicker}>In Preparation</p>
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
                            This section is currently in development. A range of reading, research, 
                            and community features are planned for members.
                        </p>
                        <p className={s.cardText}>
                            Check back soon or register to be notified when this feature becomes available.
                        </p>
                    </div>
                )}

                {feature && (
                    <Link href="/login" className={s.registerCta}>
                        <Lock size={16} />
                        Register to Unlock
                    </Link>
                )}

                <button onClick={() => router.push('/')} className={s.backButton}>
                    <ArrowLeft size={16} />
                    Return to Homepage
                </button>
            </div>
        </div>
    );
};

export default ComingSoonPage;
