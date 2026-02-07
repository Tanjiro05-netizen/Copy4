import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { knowledgeApiService } from '../components/Knowledge/api';
import { useTopics } from '../components/Knowledge/hooks/useTopics';
import { ArrowLeft, HelpCircle, Send, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';

const KnowledgeAskPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { topics, loading: topicsLoading } = useTopics(knowledgeApiService);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [topicId, setTopicId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (title.length < 10) {
            setError('Title must be at least 10 characters');
            return;
        }
        if (title.length > 300) {
            setError('Title must be less than 300 characters');
            return;
        }
        if (content.length < 20) {
            setError('Description must be at least 20 characters');
            return;
        }

        setSubmitting(true);

        const result = await knowledgeApiService.createQuestion({
            title: title.trim(),
            content: content.trim(),
            topic_id: topicId || null,
        }, user.id);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error?.message || 'Failed to submit question');
        }
        setSubmitting(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pt-24">
                    <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                        <HelpCircle size={48} className="mx-auto text-gray-600 mb-3" />
                        <h2 className="text-xl font-semibold mb-2">Login Required</h2>
                        <p className="text-gray-400 mb-4">You need to be logged in to ask a question.</p>
                        <Link to="/" className="text-red-400 hover:underline">
                            Go to login
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pt-24">
                    <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                        <h2 className="text-xl font-semibold mb-2">Question Submitted!</h2>
                        <p className="text-gray-400 mb-6">
                            Your question has been submitted and is awaiting admin approval.
                            You'll be notified once it's approved.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link 
                                to="/knowledge" 
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Back to Questions
                            </Link>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setTitle('');
                                    setContent('');
                                    setTopicId('');
                                }}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Ask Another
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pt-24">
                {/* Back link */}
                <Link 
                    to="/knowledge" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Questions
                </Link>

                <div className="bg-gray-800/50 rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
                        <HelpCircle className="text-red-500" />
                        Ask a Question
                    </h1>
                    <p className="text-gray-400 mb-6">
                        Get answers from certified comrades with expertise in Marxist theory
                    </p>

                    {/* Guidelines */}
                    <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Info size={20} className="text-blue-400 mt-0.5" />
                            <div className="text-sm text-gray-300">
                                <p className="font-medium text-blue-400 mb-2">Before you ask:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-400">
                                    <li>Search existing questions to avoid duplicates</li>
                                    <li>Be specific and clear in your question</li>
                                    <li>Provide context to help others understand</li>
                                    <li>Questions are reviewed by admins before publishing</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-red-500" />
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Topic */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Topic (optional)
                            </label>
                            <select
                                value={topicId}
                                onChange={(e) => setTopicId(e.target.value)}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                                disabled={topicsLoading}
                            >
                                <option value="">Select a topic...</option>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Question Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What do you want to know?"
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                                maxLength={300}
                                disabled={submitting}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Be specific and imagine you're asking a person</span>
                                <span>{title.length}/300</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Provide more details about your question. Include any context, what you've already learned, or why this is important to you..."
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white min-h-[200px] focus:border-red-500 focus:outline-none"
                                disabled={submitting}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Minimum 20 characters</span>
                                <span className={content.length < 20 ? 'text-red-400' : ''}>
                                    {content.length}/20 minimum
                                </span>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-500">
                                Your question will be reviewed before publishing
                            </p>
                            <button
                                type="submit"
                                disabled={submitting || title.length < 10 || content.length < 20}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <Send size={18} />
                                )}
                                Submit Question
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default KnowledgeAskPage;
