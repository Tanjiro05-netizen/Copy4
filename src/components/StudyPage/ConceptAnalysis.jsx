import React from "react";
import { BookOpen, GitBranch, Users } from "lucide-react";

const dummyConcepts = [
  { 
    concept: "历史唯物主义", 
    englishName: "Historical Materialism",
    icon: <GitBranch className="w-5 h-5" />,
    analysis: "Explains how material conditions and economic factors shape society and history." 
  },
  { 
    concept: "阶级斗争", 
    englishName: "Class Struggle",
    icon: <Users className="w-5 h-5" />,
    analysis: "Describes the conflict between different classes as the driving force of historical development." 
  },
  { 
    concept: "异化", 
    englishName: "Alienation",
    icon: <BookOpen className="w-5 h-5" />,
    analysis: "Refers to the estrangement of people from aspects of their human nature due to living in a society stratified by social classes." 
  }
];

const ConceptAnalysis = () => (
  <section>
    <ul className="space-y-4">
      {dummyConcepts.map((item, idx) => (
        <li key={idx} className="bg-black/50 rounded-lg overflow-hidden border border-red-900/30 transition-all duration-300 hover:border-red-600/60 group">
          <div className="flex items-start p-4">
            <div className="w-10 h-10 rounded-full bg-red-700/80 flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-red-600 transition-colors">
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-red-400">{item.concept}</h3>
                <span className="text-sm text-gray-400">- {item.englishName}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{item.analysis}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export default ConceptAnalysis;