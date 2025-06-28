import React from "react";
import { CheckCircle, Circle } from "lucide-react";

const dummyMilestones = [
  { step: 1, title: "阅读《共产党宣言》", englishTitle: "Read The Communist Manifesto", completed: true },
  { step: 2, title: "观看《资本论》讲座", englishTitle: "Watch Das Kapital Lecture", completed: false },
  { step: 3, title: "完成历史唯物主义播客", englishTitle: "Complete Historical Materialism Podcast", completed: false },
  { step: 4, title: "参加社区讨论", englishTitle: "Join Community Discussion", completed: false }
];

const StudyMilestones = () => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-6 bg-red-600 rounded-sm"></div>
        <span className="text-sm text-gray-400">学习进度 - Learning Progress</span>
      </div>
      <span className="text-sm text-red-400">1/4 完成</span>
    </div>
    <ol className="space-y-4">
      {dummyMilestones.map((milestone) => (
        <li 
          key={milestone.step} 
          className={`bg-black/50 rounded-lg overflow-hidden border transition-all duration-300 ${milestone.completed ? 'border-red-600/60' : 'border-red-900/30 hover:border-red-600/40'}`}
        >
          <div className="flex items-center p-4">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
              {milestone.completed ? 
                <CheckCircle className="w-6 h-6 text-red-500" /> : 
                <Circle className="w-6 h-6 text-gray-600" />}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <h3 className={`text-lg font-semibold ${milestone.completed ? 'text-red-400' : 'text-gray-400'}`}>
                  {milestone.title}
                </h3>
                <span className="text-sm text-gray-500">- {milestone.englishTitle}</span>
              </div>
            </div>
            <div className="ml-2 px-2 py-1 rounded bg-red-900/20 text-xs text-red-400">
              步骤 {milestone.step}
            </div>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

export default StudyMilestones;