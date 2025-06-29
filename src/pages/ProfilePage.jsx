import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { User, Edit3, Save, Image, Shield, Trash2, CheckCircle, Award } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: null });

    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [ideology, setIdeology] = useState('');
    const [bookmarks, setBookmarks] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [viewerRole, setViewerRole] = useState('user');

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                throw error;
            }

            if (data) {
                setProfile(data);
                setUsername(data.username || '');
                setBio(data.bio || '');
                setIdeology(data.ideology || '');
            } else {
                // If no profile exists, use email as username
                const userEmail = user.email || '';
                const usernameFromEmail = userEmail.split('@')[0];
                setUsername(usernameFromEmail);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            alert('Failed to fetch profile data.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('user_article_bookmarks')
                    .select(`
                        created_at,
                        article:theory_articles(*, category:theory_categories(name))
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setBookmarks(data);
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
            }
        };

        const fetchQuotes = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('user_quotes')
                    .select(`
                        id,
                        quote_text,
                        created_at,
                        article:theory_articles(title, slug)
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setQuotes(data);
            } catch (error) {
                console.error('Error fetching quotes:', error);
            }
        };

        const fetchViewerRole = async () => {
            if (!user) return;
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (data) setViewerRole(data.role);
        };

        fetchProfile();
        fetchBookmarks();
        fetchQuotes();
        fetchViewerRole();
    }, [fetchProfile, user]);

    const handleDeleteQuote = async (quoteId) => {
        setModalContent({
            title: 'Confirm Quote Deletion',
            message: 'Are you sure you want to delete this quote?',
            onConfirm: () => handleConfirmDeleteQuote(quoteId)
        });
        setIsModalOpen(true);
    };

    const handleConfirmDeleteQuote = async (quoteId) => {
        try {
            const { error } = await supabase
                .from('user_quotes')
                .delete()
                .eq('id', quoteId);
            
            if (error) throw error;

            setQuotes(quotes.filter(q => q.id !== quoteId));
        } catch (error) {
            console.error('Error deleting quote:', error);
            alert('Failed to delete quote.');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({ 
                    id: user.id, 
                    username,
                    bio,
                    ideology,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (error) throw error;

            alert('Profile updated successfully!');
            setEditing(false);
            fetchProfile(); // Refresh profile data
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const confirmToggleCertified = async (newStatus) => {
        if (viewerRole !== 'admin' || !profile) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_certified: newStatus })
                .eq('id', profile.id)
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
            alert(`User has been ${newStatus ? 'certified' : 'uncertified'}.`);
        } catch (error) {
            console.error('Error toggling certified status:', error);
            alert('Failed to update certified status.');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleToggleCertified = () => {
        if (viewerRole !== 'admin' || !profile) return;
        const newStatus = !profile.is_certified;
        setModalContent({
            title: `Confirm User ${newStatus ? 'Certification' : 'Decertification'}`,
            message: `Are you sure you want to ${newStatus ? 'certify' : 'uncertify'} this user?`,
            onConfirm: () => confirmToggleCertified(newStatus)
        });
        setIsModalOpen(true);
    };

    if (loading && !profile) {
        return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Loading...</div>;
    }

    return (
        <>
            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalContent.onConfirm}
                title={modalContent.title}
                message={modalContent.message}
            />
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Banner Placeholder */}
                <div className="relative h-48 bg-gray-800 rounded-t-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                    <div className="text-center text-gray-500">
                        <Image size={48} className="mx-auto" />
                        <p className="mt-2 font-semibold">Banner Coming Soon</p>
                    </div>
                </div>

                <div className="relative bg-gray-800/50 backdrop-blur-sm p-8 rounded-b-lg shadow-lg">
                    {/* Profile Picture Placeholder */}
                    <div className="absolute -top-16 left-8 w-32 h-32 bg-gray-700 rounded-full border-4 border-gray-900 flex items-center justify-center border-dashed">
                        <div className="text-center text-gray-500">
                            <User size={40} />
                            <p className="text-xs mt-1">Coming Soon</p>
                        </div>
                    </div>

                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={() => setEditing(!editing)}
                            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 disabled:opacity-50"
                            disabled={loading}
                        >
                            {editing ? <Save size={20} className="mr-2" /> : <Edit3 size={20} className="mr-2" />}
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="mt-16">
                        <form onSubmit={handleUpdateProfile}>
                            {editing ? (
                                <div className="mb-6">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
                                    <input 
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center mb-4">
                                    <h1 className="text-3xl font-bold text-white">{profile?.username || ''}</h1>
                                    {profile?.is_certified && (
                                        <span className="ml-3 flex items-center bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                            <CheckCircle size={14} className="mr-1"/> Certified
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mb-6">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-400">Bio</label>
                                <textarea 
                                    id="bio"
                                    rows="4"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    readOnly={!editing}
                                    placeholder={editing ? 'Tell us about yourself...' : 'No bio yet.'}
                                    className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:opacity-70"
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="ideology" className="block text-sm font-medium text-gray-400 flex items-center">
                                    <Shield size={16} className="mr-2"/> Ideology
                                </label>
                                <input 
                                    type="text"
                                    id="ideology"
                                    value={ideology}
                                    onChange={(e) => setIdeology(e.target.value)}
                                    readOnly={!editing}
                                    placeholder={editing ? 'e.g., Marxist-Leninist, Anarcho-Syndicalist...' : 'No ideology specified.'}
                                    className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:opacity-70"
                                />
                            </div>

                            {editing && (
                                <div className="flex justify-end">
                                    <button 
                                        type="submit"
                                        className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        <Save size={20} className="mr-2" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                        {viewerRole === 'admin' && user.id !== profile?.id && (
                            <div className="mt-6 border-t border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-red-500">Admin Actions</h3>
                                <div className="mt-4">
                                    <button 
                                        type="button"
                                        onClick={handleToggleCertified}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${profile?.is_certified ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        <Award size={20} className="mr-2"/>
                                        {profile?.is_certified ? 'Revoke Certification' : 'Grant Certification'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bookmarks Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-white mb-6">My Bookmarks</h2>
                    {bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bookmarks.map(({ article }) => article && (
                                <Link to={`/theory/article/${article.slug}`} key={article.id} className="bg-gray-800/50 rounded-lg p-4 block hover:bg-gray-800/80 transition-colors duration-200">
                                    <h3 className="text-lg font-semibold mb-2 text-white truncate">{article.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{article.category?.name || 'Uncategorized'}</span>
                                        <span>{article.estimated_time_min} min read</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                            <p className="text-gray-400">You haven't bookmarked any articles yet.</p>
                        </div>
                    )}
                </div>

                {/* Quotes Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-white mb-6">My Quotes</h2>
                    {quotes.length > 0 ? (
                        <div className="space-y-4">
                            {quotes.map((quote) => (
                                <div key={quote.id} className="bg-gray-800/50 rounded-lg p-4 relative">
                                    <blockquote className="border-l-4 border-red-500 pl-4 italic text-gray-300">
                                        <p>{quote.quote_text}</p>
                                    </blockquote>
                                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                                        <span>From: <Link to={`/theory/article/${quote.article.slug}`} className="hover:text-red-400 underline">{quote.article.title}</Link></span>
                                        <button 
                                            onClick={() => handleDeleteQuote(quote.id)}
                                            className="text-gray-500 hover:text-red-500"
                                            title="Delete quote"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                            <p className="text-gray-400">You haven't saved any quotes yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
        </>
    );
};

export default ProfilePage;
