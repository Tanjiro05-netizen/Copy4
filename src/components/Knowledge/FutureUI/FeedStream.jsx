import React, { useState } from 'react';
import { Video, Edit3, FileText, Compass, Loader2 } from 'lucide-react';
import FeedCard from './FeedCard';
import { Link } from 'react-router-dom';

const FeedStream = ({ questions, loading, user, profile, activeTab, onTabChange }) => {
  // Controlled by parent

  return (
    <>
      {/* Top Banner Carousel/Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <div className="md:col-span-2 bg-gradient-to-r from-gray-900/50 to-[#2a0a0a] border border-gray-800 rounded-sm p-3 relative overflow-hidden h-32 flex flex-col justify-end group cursor-pointer hover:border-red-500/30 transition-colors">
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Featured</div>
          <h3 className="text-lg font-bold text-white relative z-10 leading-tight">Dialectical Materialism in the AI Age</h3>
          <p className="text-xs text-red-200 relative z-10 mt-1">Exclusive analysis on automated production.</p>
          <Video className="absolute right-3 top-3 text-white/20 w-8 h-8 group-hover:text-white/40 transition-colors" />
        </div>
        <div className="md:col-span-1 bg-gray-900/50 border border-gray-800 rounded-sm p-3 flex flex-col justify-between h-32 md:h-auto">
           <div>
             <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Daily Challenge</div>
             <div className="text-xs font-bold text-white leading-tight">Define 'Surplus Value' in 100 words</div>
           </div>
           <button className="text-[10px] bg-white/10 hover:bg-white/20 text-center py-1 rounded transition-colors text-slate-300">Start Now</button>
        </div>
      </div>

      {/* Post Creator (Compact) */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-sm p-3">
        <div className="flex gap-2">
           <div className="w-8 h-8 rounded bg-slate-800 shrink-0 overflow-hidden">
              <img src={profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} className="w-full h-full" alt="avatar" />
           </div>
           <Link to="/knowledge/ask" className="flex-1 bg-white/5 rounded border border-white/5 p-2 hover:bg-white/10 transition-colors cursor-text">
             <span className="text-slate-500 text-xs font-medium block pt-0.5">Share your insights or ask a question...</span>
           </Link>
        </div>
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
          <div className="flex gap-4">
             <Link to="/knowledge/ask" className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs font-medium transition-colors"><Edit3 className="w-3 h-3" /> Answer</Link>
             <button className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs font-medium transition-colors"><Video className="w-3 h-3" /> Video</button>
             <button className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs font-medium transition-colors"><FileText className="w-3 h-3" /> Article</button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Sticky) */}
      <div className="bg-[#12131A]/95 backdrop-blur z-40 sticky top-28 border-b border-gray-800 pt-2">
        <div className="flex items-center gap-4 px-2 text-xs font-bold">
          <button onClick={() => onTabChange('recommend')} className={`pb-2 relative transition-colors ${activeTab === 'recommend' ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}>
            Recommended
            {activeTab === 'recommend' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>}
          </button>
          <button onClick={() => onTabChange('follow')} className={`pb-2 relative transition-colors ${activeTab === 'follow' ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}>Following</button>
          <button onClick={() => onTabChange('hot')} className={`pb-2 relative transition-colors ${activeTab === 'hot' ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}>Hot</button>
          <span className="flex-1"></span>
          <button className="text-slate-600 text-[10px] pb-2 flex items-center gap-1 hover:text-slate-400">Customize <Compass className="w-3 h-3"/></button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-2">
        {loading ? (
           <div className="py-12 flex justify-center text-red-500">
               <Loader2 className="animate-spin w-6 h-6" />
           </div>
        ) : questions && questions.length > 0 ? (
           questions.map((item) => (
             <FeedCard key={item.id} item={{...item, type: 'question'}} />
           ))
        ) : (
           <div className="py-12 text-center text-slate-500 text-xs">
               No questions found. Be the first to ask!
           </div>
        )}
        
         <button className="w-full py-2 bg-gray-900/50 border border-gray-800 text-xs text-slate-500 hover:text-slate-300 rounded-sm hover:bg-white/5 transition-all">
            Load More Content (R)
         </button>
      </div>
    </>
  );
};

export default FeedStream;
