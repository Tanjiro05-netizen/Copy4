import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Zap, Trophy, ChevronRight } from 'lucide-react';
import { studyApiService } from '../api/study';

const DailyChallenge = ({ userId }) => {
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [challengeData, progressData] = await Promise.all([
          studyApiService.getTodaysChallenge(),
          userId ? studyApiService.getUserProgress(userId) : null
        ]);
        
        setChallenge(challengeData);
        setProgress(progressData);
        
        if (userId && challengeData) {
          const hasCompleted = await studyApiService.hasCompletedTodaysChallenge(userId);
          setCompleted(hasCompleted);
        }
      } catch (err) {
        console.error('Error fetching daily challenge:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Countdown timer to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const streakMultiplier = progress ? studyApiService.getStreakMultiplier(progress.current_streak) : 1.0;
  const dailyXp = progress?.daily_xp_earned || 0;
  const dailyCap = 100;
  const xpPercentage = Math.min((dailyXp / dailyCap) * 100, 100);

  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-900/20 to-gray-900/80 border border-red-500/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-600/20 border-b border-red-500/30 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Daily Dialectic</span>
        </div>
        {progress?.current_streak > 0 && (
          <div className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{progress.current_streak}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Topic */}
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-medium mb-1">{getDayName()}</div>
          <div className="text-sm font-semibold text-white">
            {challenge?.title || 'No challenge today'}
          </div>
          {challenge?.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{challenge.description}</p>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs">
          {/* Time Remaining */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeRemaining}</span>
          </div>

          {/* Streak Multiplier */}
          {streakMultiplier > 1 && (
            <div className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px] font-bold">
              <span>{streakMultiplier}x</span>
            </div>
          )}
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Daily XP</span>
            <span className="text-slate-400 font-medium">{dailyXp}/{dailyCap}</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        {completed ? (
          <div className="flex items-center justify-center gap-2 bg-green-500/20 text-green-400 py-2 rounded text-xs font-medium">
            <Trophy className="w-4 h-4" />
            <span>Completed Today!</span>
          </div>
        ) : (
          <Link 
            to="/knowledge/study"
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded text-xs font-bold transition-all hover:shadow-lg hover:shadow-red-600/30 group"
          >
            <Zap className="w-4 h-4" />
            <span>Start Challenge</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Rank Preview (if logged in) */}
      {progress && (
        <div className="bg-gray-900/50 border-t border-gray-700/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{studyApiService.getRankInfo(progress.current_rank).icon}</span>
            <span className="text-xs text-slate-400 capitalize">{progress.current_rank}</span>
          </div>
          <span className="text-xs text-slate-500">{progress.total_xp} XP</span>
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;
