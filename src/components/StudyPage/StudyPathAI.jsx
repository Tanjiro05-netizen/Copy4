import React from "react";
import { BookOpen, Video, Users, FileText } from "lucide-react";

const dummyPath = [
  { 
    step: 1, 
    title: "基础理论",
    subtitle: "Foundational Theory",
    icon: <BookOpen className="w-5 h-5" />,
    suggestion: "Start with foundational texts: The Communist Manifesto." 
  },
  { 
    step: 2, 
    title: "视频讲座",
    subtitle: "Video Lectures",
    icon: <Video className="w-5 h-5" />,
    suggestion: "Watch introductory video lectures on Marxist theory." 
  },
  { 
    step: 3, 
    title: "概念分析",
    subtitle: "Concept Analysis",
    icon: <FileText className="w-5 h-5" />,
    suggestion: "Analyze key concepts: Historical Materialism, Class Struggle." 
  },
  { 
    step: 4, 
    title: "社区讨论",
    subtitle: "Community Discussion",
    icon: <Users className="w-5 h-5" />,
    suggestion: "Participate in community Q&A for clarification." 
  }
];

const StudyPathAI = () => (
  <section>
    <ul className="space-y-4">
      {dummyPath.map((item) => (
        <li key={item.step} className="bg-black/50 rounded-lg overflow-hidden border border-red-900/30 transition-all duration-300 hover:border-red-600/60 group">
          <div className="flex items-start p-4">
            <div className="w-10 h-10 rounded-full bg-red-700/80 flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-red-600 transition-colors">
              {item.step}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-red-400">{item.title}</h3>
                <span className="text-sm text-gray-400">- {item.subtitle}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-red-900/40 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="text-sm text-gray-300">{item.suggestion}</span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
    <div className="mt-6 p-4 bg-red-900/40 border border-red-700/50 rounded-lg text-red-200 text-sm">
      <strong>注意:</strong> 这个学习路径是一个占位符。真正的AI驱动个性化功能正在开发中！
      <br />
      <strong>Note:</strong> This path is a placeholder. Real AI-driven personalization features are under development!
    </div>
  </section>
);

export default StudyPathAI;