import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as s from './ComingSoonPage.css.ts';

const ComingSoonPage = () => {
    const navigate = useNavigate();

    return (
        <div className={s.page}>
            <div className={s.inner}>
                <h1 className={s.title}>Coming Soon</h1>
                <div className={s.rule} />
                
                <p className={s.subtitle}>
                    This section is under active development and will be available soon.
                </p>
                
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
                
                <button onClick={() => navigate('/')} className={s.backButton}>
                    <ArrowLeft size={16} />
                    Return to Homepage
                </button>
            </div>
        </div>
    );
};

export default ComingSoonPage;
