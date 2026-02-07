import React, { useState, useEffect } from 'react';
import { Cpu, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { knowledgeApiService } from '../api';

// Level thresholds based on total engagement (views + likes*2 + follows*5)
const LEVEL_THRESHOLDS = [
  { level: 1, min: 0, title: 'Newcomer' },
  { level: 2, min: 50, title: 'Contributor' },
  { level: 3, min: 200, title: 'Active' },
  { level: 4, min: 500, title: 'Established' },
  { level: 5, min: 1000, title: 'Influencer' },
  { level: 6, min: 2500, title: 'Expert' },
  { level: 7, min: 5000, title: 'Authority' },
  { level: 8, min: 10000, title: 'Master' },
  { level: 9, min: 25000, title: 'Legend' },
  { level: 10, min: 50000, title: 'Icon' },
];

const calculateLevel = (stats) => {
  const engagement = (stats.views || 0) + (stats.likes || 0) * 2 + (stats.follows || 0) * 5;
  let currentLevel = LEVEL_THRESHOLDS[0];
  
  for (const threshold of LEVEL_THRESHOLDS) {
    if (engagement >= threshold.min) {
      currentLevel = threshold;
    } else {
      break;
    }
  }
  
  // Calculate progress to next level
  const nextLevel = LEVEL_THRESHOLDS.find(t => t.min > engagement);
  const progress = nextLevel 
    ? Math.round(((engagement - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;
  
  return { ...currentLevel, engagement, progress, nextLevel };
};

export const Widgets = ({ userId }) => {
  const [trendingQuestions, setTrendingQuestions] = useState([]);
  const [userStats, setUserStats] = useState({ views: 0, likes: 0, follows: 0, growth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trending, stats] = await Promise.all([
          knowledgeApiService.getTrendingQuestions(7),
          userId ? knowledgeApiService.getUserStatsWithGrowth(userId) : { views: 0, likes: 0, follows: 0, growth: 0 }
        ]);
        setTrendingQuestions(trending);
        setUserStats(stats);
      } catch (err) {
        console.error('Error fetching widgets data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const levelInfo = calculateLevel(userStats);

  // Format view counts
  const formatCount = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <>
      {/* Creator Center Mini */}
      <div className="bg-gray-900/50 border border-red-600/30 rounded-sm p-3 shadow-lg relative overflow-hidden">
         <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1 text-xs font-bold text-white">
              <Cpu className="w-3 h-3 text-red-500"/> 
              Creator Lvl {levelInfo.level}
            </div>
            {userStats.growth !== 0 && (
              <div className={`text-[9px] px-1 rounded ${
                userStats.growth > 0 
                  ? 'text-green-400 bg-green-900/20' 
                  : 'text-red-400 bg-red-900/20'
              }`}>
                Growth {userStats.growth > 0 ? '+' : ''}{userStats.growth}%
              </div>
            )}
         </div>
         
         {/* Level progress bar */}
         {levelInfo.nextLevel && (
           <div className="mb-2">
             <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
               <span>{levelInfo.title}</span>
               <span>{levelInfo.progress}% to Lvl {levelInfo.nextLevel.level}</span>
             </div>
             <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                 style={{ width: `${levelInfo.progress}%` }}
               />
             </div>
           </div>
         )}
         
         <div className="grid grid-cols-3 gap-1 mb-2">
            <div className="bg-[#12131A] p-1 text-center rounded border border-gray-800">
              <div className="text-[9px] text-slate-500">Views</div>
              <div className="text-xs font-bold text-slate-200">{formatCount(userStats.views)}</div>
            </div>
            <div className="bg-[#12131A] p-1 text-center rounded border border-gray-800">
              <div className="text-[9px] text-slate-500">Likes</div>
              <div className="text-xs font-bold text-slate-200">{formatCount(userStats.likes)}</div>
            </div>
            <div className="bg-[#12131A] p-1 text-center rounded border border-gray-800">
              <div className="text-[9px] text-slate-500">Follows</div>
              <div className="text-xs font-bold text-slate-200">{formatCount(userStats.follows)}</div>
            </div>
         </div>
         <Link 
           to="/profile?tab=dashboard" 
           className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 text-[10px] py-1.5 rounded transition-colors block text-center"
         >
           Go to Dashboard
         </Link>
      </div>

      {/* Global Heatmap List */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-red-400" /> Top Search
          </h3>
          <span className="text-[9px] text-slate-500">Real-time</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="py-4 flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            </div>
          ) : trendingQuestions.length > 0 ? (
            trendingQuestions.map((question, index) => (
              <Link key={question.id} to={`/knowledge/question/${question.id}`} className="px-3 py-2 hover:bg-white/5 cursor-pointer flex gap-2 group block">
                 <div className={`text-xs font-bold font-mono w-4 shrink-0 ${index < 3 ? 'text-red-400' : 'text-slate-600'}`}>{index + 1}</div>
                 <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-300 truncate group-hover:text-red-400 transition-colors">{question.title}</div>
                    <div className="text-[9px] text-slate-600 flex gap-2 mt-0.5">
                      <span>{formatCount(question.view_count)} views</span>
                      {question.topic?.name && <span className="text-slate-500 bg-white/5 px-1 rounded">{question.topic.name}</span>}
                    </div>
                 </div>
              </Link>
            ))
          ) : (
            <div className="py-4 text-center text-[10px] text-slate-500">No trending questions yet</div>
          )}
        </div>
      </div>

      {/* Quick Links / Footer Grid */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-sm p-3">
         <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Discover</h3>
         <div className="flex flex-wrap gap-1.5">
            {['Tech', 'Science', 'Design', 'Space', 'AI', 'Ethics', 'Crypto', 'Bio-Hack'].map(tag => (
              <span key={tag} className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded cursor-pointer border border-white/5 transition-colors">{tag}</span>
            ))}
         </div>
      </div>

       <div className="text-[9px] text-slate-600 px-2 leading-relaxed">
         <a href="#" className="hover:text-slate-400 mr-2">KnowledgeBase</a>
         <a href="#" className="hover:text-slate-400 mr-2">Guidelines</a>
         <a href="#" className="hover:text-slate-400 mr-2">Privacy</a>
         <a href="#" className="hover:text-slate-400 mr-2">Terms</a>
         <br/>
         <span>© 2026 Marxist Platform. All rights reserved.</span>
      </div>
    </>
  );
};
