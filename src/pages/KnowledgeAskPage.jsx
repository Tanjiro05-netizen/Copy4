import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { knowledgeApiService } from '../components/Knowledge/api';
import { useTopics } from '../components/Knowledge/hooks/useTopics';
import { ArrowLeft, HelpCircle, Send, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import * as s from './KnowledgeAskPage.css.ts';

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
            <div className={s.page}>
                <main className={s.main}>
                    <div className={s.centerWrap}>
                        <HelpCircle size={48} className={s.centerIcon} style={{color:'rgba(255,255,255,0.28)'}} />
                        <h2 className={s.centerTitle}>Login Required</h2>
                        <p className={s.centerText}>You need to be logged in to ask a question.</p>
                        <Link to="/" className={s.centerLink}>Go to login</Link>
                    </div>
                </main>
            </div>
        );
    }

    if (success) {
        return (
            <div className={s.page}>
                <main className={s.main}>
                    <div className={s.centerWrap}>
                        <CheckCircle size={48} className={s.centerIcon} style={{color:'#2d8a4e'}} />
                        <h2 className={s.centerTitle}>Question Submitted!</h2>
                        <p className={s.centerText}>
                            Your question has been submitted and is awaiting admin approval.
                            You'll be notified once it's approved.
                        </p>
                        <div className={s.btnRow}>
                            <Link to="/knowledge" className={s.ghostBtn}>Back to Questions</Link>
                            <button
                                onClick={() => { setSuccess(false); setTitle(''); setContent(''); setTopicId(''); }}
                                className={s.submitBtn}
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
        <div className={s.page}>
            <main className={s.main}>
                <Link to="/knowledge" className={s.backLink}>
                    <ArrowLeft size={18} /> Back to Questions
                </Link>

                <div className={s.card}>
                    <h1 className={s.cardTitle} style={{display:'flex',alignItems:'center',gap:12}}>
                        <HelpCircle size={24} style={{color:'#c81e1e'}} />
                        Ask a Question
                    </h1>
                    <p className={s.hint} style={{marginBottom:24}}>
                        Get answers from certified comrades with expertise in Marxist theory
                    </p>

                    {/* Guidelines */}
                    <div style={{background:'rgba(74,127,181,0.1)',border:'1px solid rgba(74,127,181,0.25)',borderRadius:12,padding:16,marginBottom:24}}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                            <Info size={20} style={{color:'#4a7fb5',marginTop:2}} />
                            <div style={{fontSize:13}}>
                                <p style={{fontWeight:500,color:'#4a7fb5',marginBottom:8}}>Before you ask:</p>
                                <ul style={{listStyle:'disc inside',display:'flex',flexDirection:'column',gap:4,color:'rgba(255,255,255,0.48)'}}>
                                    <li>Search existing questions to avoid duplicates</li>
                                    <li>Be specific and clear in your question</li>
                                    <li>Provide context to help others understand</li>
                                    <li>Questions are reviewed by admins before publishing</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className={s.errorBox} style={{marginBottom:16}}>
                            <AlertCircle size={18} style={{flexShrink:0}} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={s.form}>
                        <div>
                            <label className={s.fieldLabel}>Topic (optional)</label>
                            <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={s.selectInput} disabled={topicsLoading}>
                                <option value="">Select a topic...</option>
                                {topics.map(topic => (<option key={topic.id} value={topic.id}>{topic.name}</option>))}
                            </select>
                        </div>

                        <div>
                            <label className={s.fieldLabel}>Question Title *</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you want to know?" className={s.textInput} maxLength={300} disabled={submitting} />
                            <div className={s.hint} style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                                <span>Be specific and imagine you're asking a person</span>
                                <span>{title.length}/300</span>
                            </div>
                        </div>

                        <div>
                            <label className={s.fieldLabel}>Description *</label>
                            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Provide more details about your question..." className={s.textArea} disabled={submitting} />
                            <div className={s.hint} style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                                <span>Minimum 20 characters</span>
                                <span style={content.length < 20 ? {color:'#c81e1e'} : {}}>{content.length}/20 minimum</span>
                            </div>
                        </div>

                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                            <p className={s.hint}>Your question will be reviewed before publishing</p>
                            <button type="submit" disabled={submitting || title.length < 10 || content.length < 20} className={s.submitBtn}>
                                {submitting ? <Loader2 size={18} /> : <Send size={18} />}
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
