import React, { useState } from 'react';
import { Coins, Sparkles, Trophy, X } from 'lucide-react';
import { studyApiService } from '../api/study';

const CollectButton = ({ results, quiz, userId, onCollected, onClose }) => {
  const [collecting, setCollecting] = useState(false);
  const [collected, setCollected] = useState(false);
  const [finalXp, setFinalXp] = useState(null);
  const [error, setError] = useState(null);

  const handleCollect = async () => {
    if (collecting || collected) return;
    
    setCollecting(true);
    setError(null);

    try {
      const { attempt, progress } = await studyApiService.submitQuizAttempt(
        userId,
        quiz.id,
        results.score,
        results.maxScore,
        results.answers,
        0 // Time taken (could track this better)
      );

      setFinalXp(attempt.xp_earned);
      setCollected(true);

      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }

      // Delay before calling onCollected to show animation
      setTimeout(() => {
        onCollected?.(attempt, progress);
      }, 1500);

    } catch (err) {
      console.error('Error collecting XP:', err);
      setError('Failed to collect XP. Please try again.');
      setCollecting(false);
    }
  };

  const percentage = results.percentage;
  const streakMultiplier = studyApiService.getStreakMultiplier(0); // Will be updated by backend

  return (
    <div className="text-center space-y-6">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <X className="w-5 h-5 text-slate-400" />
      </button>

      {/* Trophy */}
      <div className="flex justify-center">
        <div className={`p-4 rounded-full ${
          percentage >= 80 ? 'bg-yellow-500/20' :
          percentage >= 60 ? 'bg-green-500/20' :
          percentage >= 40 ? 'bg-blue-500/20' : 'bg-gray-500/20'
        }`}>
          <Trophy className={`w-12 h-12 ${
            percentage >= 80 ? 'text-yellow-400' :
            percentage >= 60 ? 'text-green-400' :
            percentage >= 40 ? 'text-blue-400' : 'text-gray-400'
          }`} />
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          {percentage >= 80 ? 'Excellent!' :
           percentage >= 60 ? 'Well Done!' :
           percentage >= 40 ? 'Good Effort!' : 'Keep Studying!'}
        </h2>
        <p className="text-slate-400 mt-1">Quiz Complete</p>
      </div>

      {/* Score */}
      <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Score</span>
          <span className="text-white font-bold">{results.score}/{results.maxScore}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Accuracy</span>
          <span className="text-white font-bold">{percentage}%</span>
        </div>
        <div className="h-px bg-gray-700" />
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Base XP</span>
          <span className="text-white font-bold">+{results.xpEarned}</span>
        </div>
      </div>

      {/* XP Display */}
      <div className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-500 ${
        collected 
          ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-500/50' 
          : 'bg-gray-800/50 border-gray-700'
      }`}>
        {/* Sparkle effects when collected */}
        {collected && (
          <>
            <Sparkles className="absolute top-2 left-4 w-5 h-5 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute top-4 right-6 w-4 h-4 text-orange-400 animate-pulse delay-100" />
            <Sparkles className="absolute bottom-3 left-8 w-4 h-4 text-yellow-300 animate-pulse delay-200" />
            <Sparkles className="absolute bottom-4 right-4 w-5 h-5 text-orange-300 animate-pulse delay-300" />
          </>
        )}

        <div className="flex items-center justify-center gap-2">
          <Coins className={`w-8 h-8 ${collected ? 'text-yellow-400' : 'text-slate-500'}`} />
          <span className={`text-4xl font-black ${collected ? 'text-yellow-400' : 'text-white'}`}>
            +{finalXp ?? results.xpEarned}
          </span>
          <span className={`text-xl ${collected ? 'text-yellow-400' : 'text-slate-400'}`}>XP</span>
        </div>

        {streakMultiplier > 1 && !collected && (
          <p className="text-xs text-orange-400 mt-2">
            Streak bonus: ×{streakMultiplier} will be applied!
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Collect Button */}
      {!collected ? (
        <button
          onClick={handleCollect}
          disabled={collecting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            collecting
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]'
          }`}
        >
          {collecting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
              Collecting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Coins className="w-5 h-5" />
              TAP TO COLLECT
            </span>
          )}
        </button>
      ) : (
        <div className="text-green-400 font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
          XP Collected!
        </div>
      )}

      {/* Skip/Close */}
      {!collected && (
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Skip for now
        </button>
      )}
    </div>
  );
};

export default CollectButton;
