import React from "react";
import { BookOpen, Video, Headphones, ArrowRight } from "lucide-react";

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
  }
];

const StudyResources = () => (
  <section>
    <ul className="space-y-4">
      {dummyResources.map((res, idx) => (
        <li key={idx} className="bg-black/50 rounded-lg overflow-hidden border border-red-900/30 transition-all duration-300 hover:border-red-600/60 group">
          <div className="flex items-start p-4">
            <div className="w-10 h-10 rounded-full bg-red-700/80 flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-red-600 transition-colors">
              {res.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 bg-red-700/80 text-xs font-semibold rounded text-red-100 uppercase tracking-wider">{res.type}</span>
                <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors duration-200">{res.title}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{res.summary}</p>
            </div>
            <a 
              href={res.link} 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-900/30 text-red-400 hover:bg-red-700 hover:text-white transition-colors ml-2 flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export default StudyResources;