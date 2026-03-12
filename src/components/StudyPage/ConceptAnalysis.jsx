import React from "react";
import { BookOpen, GitBranch, Users, FileText, Video, Headphones, ArrowUpRight, Loader2 } from "lucide-react";

const ICON_MAP = {
  BookOpen,
  GitBranch,
  Users,
  FileText,
  Video,
  Headphones,
};

const ConceptAnalysis = ({ concepts = [], loading = false }) => {
  if (loading) {
    return (
      <section className="contents">
        <div className="col-span-full flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (concepts.length === 0) {
    return (
      <section className="contents">
        <div className="col-span-full text-center text-gray-500 text-sm py-8">No concepts defined yet.</div>
      </section>
    );
  }

  return (
    <section className="contents">
      {concepts.map((item) => {
        const IconComp = ICON_MAP[item.icon_name] || BookOpen;

        return (
          <div
            key={item.id}
            className="group relative bg-gradient-to-br from-[#1a1b26] to-black border border-white/5 p-6 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute top-0 right-0 p-20 bg-red-600/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-red-600/10"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/5 text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <IconComp className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors" />
              </div>

              <div className="mb-3">
                <h3 className="text-xl font-bold text-white mb-1">{item.term}</h3>
                {item.chinese_term && (
                  <p className="text-sm font-serif italic text-red-400/80">{item.chinese_term}</p>
                )}
              </div>

              <p className="text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3 mt-3 group-hover:border-red-500/20 transition-colors">
                {item.explanation}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default ConceptAnalysis;