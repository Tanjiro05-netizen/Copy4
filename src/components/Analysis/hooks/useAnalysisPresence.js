import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';

export const useAnalysisPresence = (textId) => {
    const { user } = useAuth();
    const [activeUsers, setActiveUsers] = useState([]);
    const channelRef = useRef(null);

    useEffect(() => {
        if (!textId || !user) return;

        const channel = supabase.channel(`analysis_presence:${textId}`, {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users = Object.values(state).flat().map(presence => ({
                    id: presence.user_id,
                    username: presence.username,
                    avatar_url: presence.avatar_url,
                    section_id: presence.section_id,
                    online_at: presence.online_at,
                }));
                setActiveUsers(users.filter(u => u.id !== user.id));
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('User joined:', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('User left:', key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        username: user.email?.split('@')[0] || 'Anonymous',
                        avatar_url: null,
                        section_id: null,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
        };
    }, [textId, user]);

    const updateSection = useCallback(async (sectionId) => {
        if (!channelRef.current || !user) return;

        await channelRef.current.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            avatar_url: null,
            section_id: sectionId,
            online_at: new Date().toISOString(),
        });
    }, [user]);

    return {
        activeUsers,
        updateSection,
    };
};

export default useAnalysisPresence;
