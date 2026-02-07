import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';

export const useAnalysisComments = (textId, sectionId = null) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComments = useCallback(async () => {
        if (!textId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('analysis_text_comments')
                .select(`
                    *,
                    author:profiles!user_id(id, username, avatar_url, is_certified)
                `)
                .eq('text_id', textId)
                .order('created_at', { ascending: false });

            if (sectionId) {
                query = query.eq('section_id', sectionId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Nest replies under parent comments
            const nestedComments = nestComments(data || []);
            setComments(nestedComments);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setError(err.message || 'Failed to load comments');
        } finally {
            setLoading(false);
        }
    }, [textId, sectionId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Real-time subscription
    useEffect(() => {
        if (!textId) return;

        const channel = supabase
            .channel(`analysis_comments:${textId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'analysis_text_comments',
                    filter: `text_id=eq.${textId}`,
                },
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [textId, fetchComments]);

    const addComment = useCallback(async (content, targetSectionId, parentCommentId = null) => {
        if (!user || !textId || !content.trim()) {
            return { error: 'Missing required fields' };
        }

        try {
            const { data, error } = await supabase
                .from('analysis_text_comments')
                .insert({
                    text_id: textId,
                    section_id: targetSectionId,
                    user_id: user.id,
                    content: content.trim(),
                    parent_comment_id: parentCommentId,
                })
                .select(`
                    *,
                    author:profiles!user_id(id, username, avatar_url, is_certified)
                `)
                .single();

            if (error) throw error;

            // Refresh comments to get proper nesting
            fetchComments();
            return { data };
        } catch (err) {
            console.error('Error adding comment:', err);
            return { error: err.message || 'Failed to add comment' };
        }
    }, [user, textId, fetchComments]);

    const updateComment = useCallback(async (commentId, content) => {
        if (!user || !content.trim()) {
            return { error: 'Missing required fields' };
        }

        try {
            const { data, error } = await supabase
                .from('analysis_text_comments')
                .update({ content: content.trim() })
                .eq('id', commentId)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            fetchComments();
            return { data };
        } catch (err) {
            console.error('Error updating comment:', err);
            return { error: err.message || 'Failed to update comment' };
        }
    }, [user, fetchComments]);

    const deleteComment = useCallback(async (commentId) => {
        if (!user) {
            return { error: 'Not authenticated' };
        }

        try {
            const { error } = await supabase
                .from('analysis_text_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            fetchComments();
            return { success: true };
        } catch (err) {
            console.error('Error deleting comment:', err);
            return { error: err.message || 'Failed to delete comment' };
        }
    }, [user, fetchComments]);

    const getCommentCountBySection = useCallback(() => {
        const counts = {};
        const countInTree = (commentList) => {
            commentList.forEach(comment => {
                const sid = comment.section_id;
                if (sid) {
                    counts[sid] = (counts[sid] || 0) + 1;
                }
                if (comment.replies?.length) {
                    countInTree(comment.replies);
                }
            });
        };
        countInTree(comments);
        return counts;
    }, [comments]);

    return {
        comments,
        loading,
        error,
        addComment,
        updateComment,
        deleteComment,
        refetch: fetchComments,
        getCommentCountBySection,
    };
};

function nestComments(flatComments) {
    const commentMap = {};
    const roots = [];

    // First pass: create map
    flatComments.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: nest children
    flatComments.forEach(comment => {
        if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
            commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
        } else {
            roots.push(commentMap[comment.id]);
        }
    });

    return roots;
}

export default useAnalysisComments;
