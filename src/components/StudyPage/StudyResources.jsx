import React, { useState } from "react";
import { BookOpen, Video, Headphones, ArrowRight, Loader2, Library } from "lucide-react";
import { Link } from "react-router-dom";

const categories = ["All", "text", "video", "audio", "lecture"];
const categoryLabels = { All: "All", text: "Text", video: "Video", audio: "Audio", lecture: "Lecture" };

const typeIconMap = {
  video: <Video className="w-5 h-5" />,
  audio: <Headphones className="w-5 h-5" />,
  lecture: <Video className="w-5 h-5" />,
  text: <BookOpen className="w-5 h-5" />,
};

const typeColorMap = {
  video: { icon: 'bg-blue-900/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white', badge: 'bg-blue-900/30 text-blue-300' },
  audio: { icon: 'bg-purple-900/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white', badge: 'bg-purple-900/30 text-purple-300' },
  lecture: { icon: 'bg-cyan-900/20 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white', badge: 'bg-cyan-900/30 text-cyan-300' },
  text: { icon: 'bg-red-900/20 text-red-400 group-hover:bg-red-600 group-hover:text-white', badge: 'bg-red-900/30 text-red-300' },
};

const StudyResources = ({ resources = [], loading = false }) => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredResources = activeCategory === "All"
    ? resources
    : resources.filter(res => res.type === activeCategory);

  return (
    <section className="space-y-6">
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
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        </div>
      ) : filteredResources.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">No resources match this filter yet.</p>
      ) : (
        <div className="grid gap-4">
          {filteredResources.map((res) => {
            const colors = typeColorMap[res.type] || typeColorMap.text;
            const icon = typeIconMap[res.type] || typeIconMap.text;
            const href = res.digital_library_book_id
              ? `/book/${res.digital_library_book_id}`
              : res.content_url || '#';
            const isExternal = href.startsWith('http');

            return (
              <div
                key={res.id}
                className="group relative bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-red-900/20 transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-start p-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 transition-colors duration-300 ${colors.icon}`}>
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${colors.badge}`}>
                        {res.type}
                      </span>
                      {res.is_featured && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm bg-yellow-900/30 text-yellow-300">
                          Featured
                        </span>
                      )}
                      {res.digital_library_book_id && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-sm bg-emerald-900/30 text-emerald-300">
                          <Library className="w-3 h-3" /> In Library
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-red-400 transition-colors truncate pr-8">
                      {res.title}
                    </h3>

                    {res.author && (
                      <p className="text-xs text-gray-500 mb-1.5">{res.author}</p>
                    )}

                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                      {res.excerpt || 'No description available.'}
                    </p>
                  </div>

                  {isExternal ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-4 top-4 p-2 rounded-full bg-white/5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      to={href}
                      className="absolute right-4 top-4 p-2 rounded-full bg-white/5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default StudyResources;