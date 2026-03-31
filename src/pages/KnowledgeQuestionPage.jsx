import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { knowledgeApiService } from '../components/Knowledge/api';
import { useQuestion } from '../components/Knowledge/hooks/useQuestions';
import { useAnswers } from '../components/Knowledge/hooks/useAnswers';
import { useVotes } from '../components/Knowledge/hooks/useVotes';
import { 
    ArrowLeft, ThumbsUp, ThumbsDown, Eye, Clock, CheckCircle, 
    User, Award, MessageSquare, Loader2, AlertCircle, Send
} from 'lucide-react';
import * as s from './KnowledgeQuestionPage.css.ts';

const KnowledgeQuestionPage = () => {
    const { questionId } = useParams();
    const { user, profile } = useAuth();
    
    const { question, loading: questionLoading } = useQuestion(knowledgeApiService, questionId);
    const { answers, loading: answersLoading, createAnswer, refetch: refetchAnswers } = useAnswers(knowledgeApiService, questionId);
    const { getVote: getAnswerVote, vote: voteAnswer } = useVotes(knowledgeApiService, user?.id, 'answer');
    const { getVote: getQuestionVote, vote: voteQuestion } = useVotes(knowledgeApiService, user?.id, 'question');

    const [answerContent, setAnswerContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const isCertified = profile?.is_certified || profile?.role === 'admin';
    const isQuestionAuthor = user?.id === question?.author_id;

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!answerContent.trim() || answerContent.length < 50) {
            setSubmitError('Answer must be at least 50 characters');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);
        
        const result = await createAnswer(answerContent);
        
        if (result.success) {
            setAnswerContent('');
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 5000);
        } else {
            setSubmitError(result.error?.message || 'Failed to submit answer');
        }
        setSubmitting(false);
    };

    const handleAcceptAnswer = async (answerId) => {
        const result = await knowledgeApiService.acceptAnswer(questionId, answerId, user.id);
        if (result.success) {
            refetchAnswers();
        }
    };

    const handleVoteQuestion = async (voteType) => {
        if (!user) return;
        await voteQuestion(questionId, voteType);
    };

    const handleVoteAnswer = async (answerId, voteType) => {
        if (!user) return;
        await voteAnswer(answerId, voteType);
    };

    if (questionLoading) {
        return (
            <div className={s.page}>
                <main className={s.main}>
                    <div className={s.loadingWrap}>
                        <Loader2 size={24} style={{marginRight:8}} />
                        <span style={{color:'rgba(255,255,255,0.48)'}}>Loading question...</span>
                    </div>
                </main>
            </div>
        );
    }

    if (!question) {
        return (
            <div className={s.page}>
                <main className={s.main}>
                    <div className={s.errorWrap}>
                        <AlertCircle size={48} className={s.errorIcon} />
                        <h2 className={s.errorTitle}>Question not found</h2>
                        <p className={s.errorText}>This question may have been removed or is pending approval.</p>
                        <Link to="/knowledge" className={s.errorLink}>← Back to Knowledge Q&A</Link>
                    </div>
                </main>
            </div>
        );
    }

    const questionVote = getQuestionVote(questionId);

    return (
        <div className={s.page}>
            <main className={s.main}>
                <Link to="/knowledge" className={s.backLink}>
                    <ArrowLeft size={18} /> Back to Questions
                </Link>

                {/* Question */}
                <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                    {/* Status banner for pending */}
                    {question.status === 'pending' && (
                        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-yellow-500" />
                            <span className="text-yellow-400">This question is awaiting approval</span>
                        </div>
                    )}

                    <div className="flex gap-6">
                        {/* Vote buttons */}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => handleVoteQuestion('up')}
                                disabled={!user}
                                className={`p-2 rounded-lg transition-colors ${
                                    questionVote === 'up' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <ThumbsUp size={20} />
                            </button>
                            <span className="text-xl font-bold">{question.upvote_count || 0}</span>
                        </div>

                        {/* Question content */}
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-4">
                                {question.is_answered && (
                                    <CheckCircle size={24} className="inline mr-2 text-green-500" />
                                )}
                                {question.title}
                            </h1>

                            <div className="prose prose-invert max-w-none mb-6">
                                <p className="text-gray-300 whitespace-pre-wrap">{question.content}</p>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-gray-700 pt-4">
                                {question.topic && (
                                    <Link 
                                        to={`/knowledge?topic=${question.topic.slug}`}
                                        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                                    >
                                        {question.topic.name}
                                    </Link>
                                )}
                                <div className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {question.view_count} views
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {new Date(question.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <span>Asked by</span>
                                    <div className="flex items-center gap-1">
                                        {question.author?.avatar_url ? (
                                            <img src={question.author.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <User size={16} />
                                        )}
                                        <Link 
                                            to={`/profile/${question.author?.username}`}
                                            className="text-red-400 hover:underline"
                                        >
                                            {question.author?.username || 'Anonymous'}
                                        </Link>
                                        {question.author?.is_certified && (
                                            <Award size={14} className="text-blue-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answers section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare size={20} />
                        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                    </h2>

                    {answersLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin mr-2" size={20} />
                            <span className="text-gray-400">Loading answers...</span>
                        </div>
                    ) : answers.length === 0 ? (
                        <div className="text-center py-8 bg-gray-800/30 rounded-lg">
                            <MessageSquare size={32} className="mx-auto text-gray-600 mb-2" />
                            <p className="text-gray-400">No answers yet. Be the first to answer!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {answers.map(answer => (
                                <AnswerCard
                                    key={answer.id}
                                    answer={answer}
                                    vote={getAnswerVote(answer.id)}
                                    onVote={(voteType) => handleVoteAnswer(answer.id, voteType)}
                                    canAccept={isQuestionAuthor && !answer.is_accepted}
                                    onAccept={() => handleAcceptAnswer(answer.id)}
                                    isLoggedIn={!!user}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Answer form */}
                {user && isCertified ? (
                    <div className="bg-gray-800/50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
                        
                        {submitSuccess && (
                            <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-4 flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-500" />
                                <span className="text-green-400">Answer submitted! It will appear after admin approval.</span>
                            </div>
                        )}

                        {submitError && (
                            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4 flex items-center gap-2">
                                <AlertCircle size={18} className="text-red-500" />
                                <span className="text-red-400">{submitError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmitAnswer}>
                            <textarea
                                value={answerContent}
                                onChange={(e) => setAnswerContent(e.target.value)}
                                placeholder="Write your answer here... (minimum 50 characters)"
                                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white min-h-[200px] mb-2 focus:border-red-500 focus:outline-none"
                                disabled={submitting}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    {answerContent.length}/50 characters minimum
                                </span>
                                <button
                                    type="submit"
                                    disabled={submitting || answerContent.length < 50}
                                    className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                    Submit Answer
                                </button>
                            </div>
                        </form>
                    </div>
                ) : user ? (
                    <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                        <Award size={32} className="mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-400">Only certified users can answer questions.</p>
                        <p className="text-sm text-gray-500 mt-1">Contact an admin to get certified.</p>
                    </div>
                ) : (
                    <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                        <User size={32} className="mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-400">Log in to answer this question.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

const AnswerCard = ({ answer, vote, onVote, canAccept, onAccept, isLoggedIn }) => {
    return (
        <div className={`bg-gray-800/50 rounded-lg p-5 ${answer.is_accepted ? 'border-2 border-green-600' : ''}`}>
            {answer.is_accepted && (
                <div className="flex items-center gap-2 text-green-500 mb-3 pb-3 border-b border-gray-700">
                    <CheckCircle size={18} />
                    <span className="font-medium">Accepted Answer</span>
                </div>
            )}

            {answer.status === 'pending' && (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-2 mb-3 text-sm flex items-center gap-2">
                    <Clock size={14} className="text-yellow-500" />
                    <span className="text-yellow-400">Awaiting approval</span>
                </div>
            )}

            <div className="flex gap-4">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => onVote('up')}
                        disabled={!isLoggedIn}
                        className={`p-1.5 rounded transition-colors ${
                            vote === 'up' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <ThumbsUp size={16} />
                    </button>
                    <span className="text-sm font-medium">
                        {(answer.upvote_count || 0) - (answer.downvote_count || 0)}
                    </span>
                    <button
                        onClick={() => onVote('down')}
                        disabled={!isLoggedIn}
                        className={`p-1.5 rounded transition-colors ${
                            vote === 'down' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <ThumbsDown size={16} />
                    </button>
                </div>

                {/* Answer content */}
                <div className="flex-1">
                    <div className="prose prose-invert max-w-none mb-4">
                        <p className="text-gray-300 whitespace-pre-wrap">{answer.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-700 pt-3">
                        <div className="flex items-center gap-2">
                            {answer.author?.avatar_url ? (
                                <img src={answer.author.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                                <User size={16} />
                            )}
                            <Link 
                                to={`/profile/${answer.author?.username}`}
                                className="text-red-400 hover:underline"
                            >
                                {answer.author?.username || 'Anonymous'}
                            </Link>
                            {answer.is_expert_answer && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-900/50 text-blue-400 text-xs rounded-full">
                                    <Award size={12} />
                                    Certified
                                </span>
                            )}
                            <span>•</span>
                            <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                        </div>

                        {canAccept && (
                            <button
                                onClick={onAccept}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors text-white text-xs"
                            >
                                <CheckCircle size={14} />
                                Accept
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeQuestionPage;
