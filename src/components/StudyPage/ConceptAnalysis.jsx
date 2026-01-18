import React from "react";
import { BookOpen, GitBranch, Users, ArrowUpRight } from "lucide-react";

const dummyConcepts = [
  { 
    concept: "历史唯物主义", 
    englishName: "Historical Materialism",
    icon: <GitBranch className="w-6 h-6" />,
    analysis: "Explains how material conditions and economic factors shape society and history." 
  },
  { 
    concept: "阶级斗争", 
    englishName: "Class Struggle",
    icon: <Users className="w-6 h-6" />,
    analysis: "Describes the conflict between different classes as the driving force of historical development." 
  },
  { 
    concept: "异化", 
    englishName: "Alienation",
    icon: <BookOpen className="w-6 h-6" />,
    analysis: "Refers to the estrangement of people from aspects of their human nature due to living in a society stratified by social classes." 
  }
];

const ConceptAnalysis = () => (
  <section className="contents">
    {dummyConcepts.map((item, idx) => (
      <div 
        key={idx} 
        className="group relative bg-gradient-to-br from-[#1a1b26] to-black border border-white/5 p-6 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 p-20 bg-red-600/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-red-600/10"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-white/5 text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              {item.icon}
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors" />
          </div>
          
          <div className="mb-3">
            <h3 className="text-xl font-bold text-white mb-1">{item.englishName}</h3>
            <p className="text-sm font-serif italic text-red-400/80">{item.concept}</p>
          </div>
          
          <p className="text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3 mt-3 group-hover:border-red-500/20 transition-colors">
            {item.analysis}
          </p>
        </div>
      </div>
    ))}
  </section>
);

export default ConceptAnalysis;