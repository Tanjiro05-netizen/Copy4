import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Shield, Sparkles, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const PendingAccessPage = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmitCode = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim() || !user) return;

        setLoading(true);
        setError('');

        try {
            const { data, error: rpcError } = await supabase.rpc('use_invite_code', {
                p_code: inviteCode.toUpperCase(),
                p_user_id: user.id
            });

            if (rpcError) {
                setError('Something went wrong. Please try again.');
            } else if (data && data.success) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setError(data?.error || 'Invalid or already used invite code.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
                <div className="w-full max-w-lg text-center">
                    <div className="flex justify-center mb-6">
                        <Shield size={48} className="text-red-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
                        Invite-Only Access
                    </h1>
                    <div className="h-1 w-24 bg-red-600 mx-auto mb-8"></div>

                    <p className="text-lg mb-8 text-gray-300">
                        This section is currently available only to invited members.
                        You can still browse the <span className="text-white font-medium">Home</span>, <span className="text-white font-medium">Digital Library</span>, and <span className="text-white font-medium">Forum</span> pages.
                    </p>

                    <div className="bg-black/30 p-6 rounded-lg border border-red-900/20 mb-8">
                        <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                            <Sparkles size={20} className="text-yellow-500" />
                            Have an invite code?
                        </h2>

                        {success ? (
                            <div className="flex items-center justify-center gap-2 text-green-400 py-4">
                                <CheckCircle size={20} />
                                <span>Access granted! Redirecting...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitCode} className="space-y-4">
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-yellow-500 focus:outline-none uppercase tracking-wider text-center text-lg"
                                    placeholder="XXXX-XXXX"
                                />
                                {error && (
                                    <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                                        <AlertTriangle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading || !inviteCode.trim()}
                                    className="w-full p-3 bg-red-700 hover:bg-red-800 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" size={20} />}
                                    {loading ? 'Verifying...' : 'Redeem Invite Code'}
                                </button>
                            </form>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center justify-center mx-auto text-gray-400 hover:text-white py-3 px-6 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingAccessPage;
