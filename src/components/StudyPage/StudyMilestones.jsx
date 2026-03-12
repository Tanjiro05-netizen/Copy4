import React from "react";
import { CheckCircle, Trophy, ChevronRight, Loader2 } from "lucide-react";

const StudyMilestones = ({ milestones = [], userProgress = {}, loading = false, onToggle }) => {
  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => userProgress[m.id]?.completed).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const levelLabel = progress >= 100
    ? 'Revolutionary Scholar'
    : progress >= 75
      ? 'Level 3 Scholar'
      : progress >= 50
        ? 'Level 2 Scholar'
        : progress >= 25
          ? 'Level 1 Scholar'
          : 'New Student';

  if (loading) {
    return (
      <section className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
      </section>
    );
  }

  if (totalCount === 0) {
    return (
      <section className="py-8 text-center text-gray-500 text-sm">No milestones defined yet.</section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-gray-200">{levelLabel}</span>
          </div>
          <span className="text-xs font-mono text-red-400">{progress}% Complete</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-900 to-red-600 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>

      <div className="relative pl-2 space-y-1">
        <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-gray-800"></div>

        {milestones.map((milestone) => {
          const isCompleted = userProgress[milestone.id]?.completed === true;

          return (
            <div key={milestone.id} className="relative pl-8 py-2 group">
              <div className={`absolute left-[7px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300 ${
                isCompleted
                  ? 'bg-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : 'bg-black border-gray-700 group-hover:border-gray-500'
              }`}>
                {isCompleted && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
              </div>

              <button
                type="button"
                onClick={() => onToggle?.(milestone.id, !isCompleted)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-300 flex items-center justify-between ${
                  isCompleted
                    ? 'bg-red-900/10 border-red-900/30'
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className={`text-sm font-medium truncate ${
                    isCompleted ? 'text-red-200' : 'text-gray-400 group-hover:text-gray-200'
                  }`}>
                    {milestone.chinese_title || milestone.title}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {milestone.chinese_title ? milestone.title : (milestone.description || '')}
                  </p>
                </div>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 flex-shrink-0" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StudyMilestones;