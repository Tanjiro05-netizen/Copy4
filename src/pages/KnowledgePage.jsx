import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { knowledgeApiService } from '../components/Knowledge/api';
import { useQuestions } from '../components/Knowledge/hooks/useQuestions';

// Zhihu Future UI Components
import KnowledgeLayout from '../components/Knowledge/FutureUI/KnowledgeLayout';
import DenseSidebar from '../components/Knowledge/FutureUI/DenseSidebar';
import FeedStream from '../components/Knowledge/FutureUI/FeedStream';
import { Widgets } from '../components/Knowledge/FutureUI/Widgets';
import DailyChallenge from '../components/Knowledge/Study/DailyChallenge';

const KnowledgePage = () => {
    const { user, profile } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('feed'); // feed, hot, favorites
    const [favorites, setFavorites] = useState([]);
    
    const topicSlug = searchParams.get('topic');
    const sortBy = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Map URL sort to UI tab
    const activeTab = useMemo(() => {
        if (sortBy === 'popular') return 'hot';
        if (sortBy === 'following') return 'follow';
        return 'recommend';
    }, [sortBy]);

    // Fetch favorites when in favorites view
    useEffect(() => {
        if (viewMode === 'favorites' && user?.id) {
            knowledgeApiService.getFavorites(user.id).then(setFavorites);
        }
    }, [viewMode, user?.id]);

    const handleTabChange = (tab) => {
        let newSort = 'recent';
        if (tab === 'hot') newSort = 'popular';
        if (tab === 'follow') newSort = 'recent'; // Fallback until following is implemented

        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set('sort', newSort);
            params.delete('page');
            return params;
        });
    };

    const handleSidebarNavigate = (key) => {
        setViewMode(key);
        if (key === 'feed') {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set('sort', 'recent');
                params.delete('page');
                return params;
            });
        } else if (key === 'hot') {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set('sort', 'popular');
                params.delete('page');
                return params;
            });
        }
    };

    const { questions, loading } = useQuestions(knowledgeApiService, {
        topicSlug,
        page,
        sortBy: viewMode === 'hot' ? 'popular' : sortBy,
        status: 'approved',
    });

    // Use favorites list when in favorites view
    const displayQuestions = viewMode === 'favorites' ? favorites : questions;

    return (
        <KnowledgeLayout
            sidebar={
                <>
                    <DenseSidebar 
                        activeItem={viewMode} 
                        onNavigate={handleSidebarNavigate}
                        userId={user?.id}
                    />
                    <div className="mt-4">
                        <DailyChallenge userId={user?.id} />
                    </div>
                </>
            }
            widgets={<Widgets userId={user?.id} />}
        >
            <FeedStream 
                questions={displayQuestions}
                loading={loading && viewMode !== 'favorites'}
                user={user}
                profile={profile}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                viewMode={viewMode}
            />
        </KnowledgeLayout>
    );
};

export default KnowledgePage;
