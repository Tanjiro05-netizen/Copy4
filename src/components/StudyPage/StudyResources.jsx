import React, { useState } from "react";
import { BookOpen, Video, Headphones, ArrowRight, Filter } from "lucide-react";

const dummyResources = [
  {
    title: "The Communist Manifesto",
    type: "Text",
    icon: <BookOpen className="w-5 h-5" />,
    summary: "A foundational Marxist text by Karl Marx and Friedrich Engels.",
    link: "#"
  },
  {
    title: "Das Kapital (Video Lecture)",
    type: "Video",
    icon: <Video className="w-5 h-5" />,
    summary: "An overview of Marx's critique of political economy.",
    link: "#"
  },
  {
    title: "Historical Materialism (Podcast)",
    type: "Audio",
    icon: <Headphones className="w-5 h-5" />,
    summary: "Podcast episode explaining historical materialism.",
    link: "#"
  },
  {
    title: "Wage Labour and Capital",
    type: "Text",
    icon: <BookOpen className="w-5 h-5" />,
    summary: "Introduction to the economic relationships of capitalism.",
    link: "#"
  }
];

const categories = ["All", "Text", "Video", "Audio"];

const StudyResources = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredResources = activeCategory === "All" 
    ? dummyResources 
    : dummyResources.filter(res => res.type === activeCategory);

  return (
    <section className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-red-900/20">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 border ${
              activeCategory === cat
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20"
                : "bg-black/30 text-gray-400 border-transparent hover:border-red-900/50 hover:text-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid gap-4">
        {filteredResources.map((res, idx) => (
          <div 
            key={idx} 
            className="group relative bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-red-900/20 transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-start p-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 transition-colors duration-300 ${
                res.type === 'Video' ? 'bg-blue-900/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' :
                res.type === 'Audio' ? 'bg-purple-900/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white' :
                'bg-red-900/20 text-red-400 group-hover:bg-red-600 group-hover:text-white'
              }`}>
                {res.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                    res.type === 'Video' ? 'bg-blue-900/30 text-blue-300' :
                    res.type === 'Audio' ? 'bg-purple-900/30 text-purple-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {res.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-red-400 transition-colors truncate pr-8">
                  {res.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                  {res.summary}
                </p>
              </div>

              <a 
                href={res.link} 
                className="absolute right-4 top-4 p-2 rounded-full bg-white/5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
              >
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StudyResources;