import React from "react";
import { CheckCircle, Circle, Trophy, ChevronRight } from "lucide-react";

const dummyMilestones = [
  { step: 1, title: "阅读《共产党宣言》", englishTitle: "Read The Communist Manifesto", completed: true },
  { step: 2, title: "观看《资本论》讲座", englishTitle: "Watch Das Kapital Lecture", completed: false },
  { step: 3, title: "完成历史唯物主义播客", englishTitle: "Complete Historical Materialism Podcast", completed: false },
  { step: 4, title: "参加社区讨论", englishTitle: "Join Community Discussion", completed: false }
];

const StudyMilestones = () => {
  const completedCount = dummyMilestones.filter(m => m.completed).length;
  const totalCount = dummyMilestones.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <section className="space-y-6">
      {/* Progress Header */}
      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-gray-200">Level 1 Scholar</span>
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

      {/* Timeline */}
      <div className="relative pl-2 space-y-1">
        {/* Vertical Line */}
        <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-gray-800"></div>

        {dummyMilestones.map((milestone, idx) => (
          <div key={milestone.step} className="relative pl-8 py-2 group">
            {/* Dot */}
            <div className={`absolute left-[7px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300 ${
              milestone.completed 
                ? 'bg-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                : 'bg-black border-gray-700 group-hover:border-gray-500'
            }`}>
              {milestone.completed && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
            </div>

            <div className={`p-3 rounded-lg border transition-all duration-300 flex items-center justify-between ${
              milestone.completed 
                ? 'bg-red-900/10 border-red-900/30' 
                : 'bg-transparent border-transparent hover:bg-white/5'
            }`}>
              <div className="flex-1 min-w-0 mr-4">
                <h3 className={`text-sm font-medium truncate ${
                  milestone.completed ? 'text-red-200' : 'text-gray-400 group-hover:text-gray-200'
                }`}>
                  {milestone.title}
                </h3>
                <p className="text-xs text-gray-600 truncate">{milestone.englishTitle}</p>
              </div>
              {milestone.completed ? (
                <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StudyMilestones;