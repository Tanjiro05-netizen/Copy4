import React from 'react';
import { 
  ChevronUp, 
  MessageSquare, 
  Star, 
  Eye, 
  MoreHorizontal, 
  Flame,
  CheckCircle,
  Award,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeedCard = ({ item }) => {
  // Determine if it's an ad or promoted content
  const isAd = item.type === 'promoted';
  
  // Format numbers for dense display (e.g. 12543 -> 12.5k)
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className={`bg-gray-900/50 border rounded-sm p-3 transition-all hover:bg-[#250a0a] group relative ${isAd ? 'border-yellow-900/30 bg-yellow-900/5' : 'border-gray-800'}`}>
      
      {isAd && <span className="absolute top-2 right-2 text-[9px] text-slate-600 border border-slate-700 px-1 rounded">Ad</span>}

      {/* Dense Header */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        {!isAd && (
          <div className="flex items-center gap-1">
            {item.author?.avatar_url ? (
                <img src={item.author.avatar_url} className="w-4 h-4 rounded-full bg-slate-700" alt={item.author.username} />
            ) : (
                <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                    <User size={10} className="text-slate-400" />
                </div>
            )}
            <Link to={`/profile/${item.author?.username}`} className="text-xs font-bold text-slate-200 hover:text-red-400 transition-colors">
                {item.author?.username || 'Anonymous'}
            </Link>
            {item.author?.role && (
                <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{item.author.role}</span>
            )}
          </div>
        )}
        
        {item.author?.is_certified && (
             <span className="text-[9px] bg-red-600/10 text-red-400 px-1 rounded border border-red-600/20 flex items-center gap-0.5">
                 <Award size={8} /> Certified
             </span>
        )}
        
        <span className="text-[10px] text-slate-600">· {new Date(item.created_at).toLocaleDateString()}</span>
        {isAd && <span className="text-xs font-bold text-slate-200">{item.author}</span>}
      </div>

      {/* Title */}
      <Link to={`/knowledge/question/${item.id}`}>
        <h2 className="text-sm md:text-base font-bold text-slate-100 leading-snug mb-1.5 group-hover:text-red-400 transition-colors cursor-pointer flex items-start gap-2">
            <span className={`shrink-0 text-[10px] font-mono px-1 rounded mt-0.5 border ${
                item.type === 'question' ? 'text-orange-400 border-orange-400/30' : 'text-red-400 border-red-400/30'
            }`}>
            {item.type === 'question' ? 'Q' : isAd ? 'AD' : 'A'}
            </span>
            {item.is_answered && (
                <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
            )}
            {item.title}
        </h2>
      </Link>

      {/* Content */}
      <div className="flex gap-3 mb-2">
        {item.hasImage && (
          <div className="w-24 h-16 shrink-0 rounded-sm overflow-hidden border border-white/10 bg-slate-800">
            <img src={item.imageUrl} className="w-full h-full object-cover" alt="content" />
          </div>
        )}
        <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 md:line-clamp-3">
            {item.content || item.excerpt}
            </p>
        </div>
      </div>

      {/* Dense Footer Action Bar */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 bg-red-600/10 text-red-400 px-2 py-0.5 rounded text-xs font-bold border border-red-600/20 hover:bg-red-600/20 transition-colors">
            <ChevronUp className="w-3 h-3" /> {formatNumber(item.upvote_count || item.votes)}
          </button>
          <button className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">
            <MessageSquare className="w-3 h-3" /> {formatNumber(item.answer_count || item.comments)}
          </button>
          <button className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">
            <Star className="w-3 h-3" /> Collect
          </button>
          {(item.view_count || item.views) && (
            <span className="flex items-center gap-1 text-[10px] text-slate-600 ml-1">
              <Eye className="w-3 h-3" /> {formatNumber(item.view_count || item.views)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
            {item.topic && (
                <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-slate-500 border border-white/5">
                    {item.topic.name}
                </span>
            )}
            <button className="text-xs text-slate-600 hover:text-slate-400">Share</button>
            <MoreHorizontal className="w-3 h-3 text-slate-600" />
        </div>
      </div>

      {/* Promoted Comment / Engagement Line (Simulation) */}
      {!isAd && item.hot_comment && (
        <div className="mt-2 bg-[#12131A] p-1.5 rounded-sm flex items-center gap-2 text-[10px] border border-gray-800">
          <span className="text-red-400 font-bold flex items-center gap-1"><Flame className="w-2 h-2" /> Hot:</span>
          <span className="text-slate-500 truncate">{item.hot_comment}</span>
        </div>
      )}

    </div>
  );
};

export default FeedCard;
