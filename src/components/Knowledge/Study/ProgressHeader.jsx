import React from 'react';
import { Flame, Users, TrendingUp } from 'lucide-react';
import { studyApiService } from '../api/study';

const ProgressHeader = ({ progress, userCell }) => {
  const rankInfo = studyApiService.getRankInfo(progress?.current_rank || 'noob');
  const nextRankXp = studyApiService.getXpForNextRank(progress?.current_rank || 'noob');
  const currentXp = progress?.total_xp || 0;
  const streakMultiplier = studyApiService.getStreakMultiplier(progress?.current_streak || 0);
  
  // Calculate progress to next rank
  const prevRankXp = {
    noob: 0,
    activist: 500,
    organizer: 1500,
    cadre: 3500,
    revolutionary: 7000,
    vanguard: 12000
  }[progress?.current_rank || 'noob'] || 0;
  
  const xpInCurrentRank = currentXp - prevRankXp;
  const xpNeededForNext = nextRankXp ? nextRankXp - prevRankXp : 0;
  const progressPercentage = nextRankXp 
    ? Math.min((xpInCurrentRank / xpNeededForNext) * 100, 100) 
    : 100;

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Rank & XP */}
        <div className="flex items-center gap-4">
          {/* Rank Badge */}
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl
            ${rankInfo.color === 'gray' ? 'bg-gray-700/50' : ''}
            ${rankInfo.color === 'green' ? 'bg-green-500/20' : ''}
            ${rankInfo.color === 'blue' ? 'bg-blue-500/20' : ''}
            ${rankInfo.color === 'purple' ? 'bg-purple-500/20' : ''}
            ${rankInfo.color === 'red' ? 'bg-red-500/20' : ''}
            ${rankInfo.color === 'gold' ? 'bg-yellow-500/20' : ''}
          `}>
            {rankInfo.icon}
          </div>
          
          {/* Rank Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold uppercase tracking-wider
                ${rankInfo.color === 'gray' ? 'text-gray-400' : ''}
                ${rankInfo.color === 'green' ? 'text-green-400' : ''}
                ${rankInfo.color === 'blue' ? 'text-blue-400' : ''}
                ${rankInfo.color === 'purple' ? 'text-purple-400' : ''}
                ${rankInfo.color === 'red' ? 'text-red-400' : ''}
                ${rankInfo.color === 'gold' ? 'text-yellow-400' : ''}
              `}>
                {rankInfo.label}
              </span>
            </div>
            
            {/* XP Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500
                    ${rankInfo.color === 'gray' ? 'bg-gray-500' : ''}
                    ${rankInfo.color === 'green' ? 'bg-green-500' : ''}
                    ${rankInfo.color === 'blue' ? 'bg-blue-500' : ''}
                    ${rankInfo.color === 'purple' ? 'bg-purple-500' : ''}
                    ${rankInfo.color === 'red' ? 'bg-red-500' : ''}
                    ${rankInfo.color === 'gold' ? 'bg-yellow-500' : ''}
                  `}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{currentXp.toLocaleString()} XP</span>
                {nextRankXp && (
                  <span className="text-slate-500">
                    {(nextRankXp - currentXp).toLocaleString()} to next rank
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {/* Streak */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Flame className={`w-5 h-5 ${
                (progress?.current_streak || 0) >= 7 ? 'text-orange-400' : 'text-slate-500'
              }`} />
              <span className="text-xl font-bold text-white">
                {progress?.current_streak || 0}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase mt-0.5">Day Streak</div>
            {streakMultiplier > 1 && (
              <div className="text-[10px] text-orange-400 font-bold mt-0.5">
                {streakMultiplier}x Bonus
              </div>
            )}
          </div>

          {/* Daily XP */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-xl font-bold text-white">
                {progress?.daily_xp_earned || 0}
              </span>
              <span className="text-sm text-slate-500">/100</span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase mt-0.5">Today's XP</div>
          </div>

          {/* Cell */}
          {userCell && (
            <div className="text-center hidden md:block">
              <div className="flex items-center justify-center gap-1.5">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-white truncate max-w-[100px]">
                  {userCell.name}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Your Cell</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressHeader;
