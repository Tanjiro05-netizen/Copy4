import React from "react";
import { Link } from "react-router-dom";
import StudyResources from "../components/StudyPage/StudyResources";
import StudyMilestones from "../components/StudyPage/StudyMilestones"; // Assuming this component exists
import StudyPathAI from "../components/StudyPage/StudyPathAI";
import ConceptAnalysis from "../components/StudyPage/ConceptAnalysis";
import Header from "../components/Header";
import { BookOpen, Video, FileText, Users, Search } from "lucide-react";


const StudyPage = () => (
  <div className="min-h-screen bg-[#12131A] overflow-y-auto">
    {/* Hero Banner Section - Similar to Chinese website */}
    <div className="relative bg-[#12131A] min-h-[40vh] mb-8">
      <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/Marx.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.7) contrast(1.2)',
            mixBlendMode: 'soft-light'
          }}
        ></div>
      </div>
      
      <Header />
      
      <div className="relative pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">学习中心</h1>
            <h2 className="text-3xl font-bold text-red-500 mb-4">Study Center</h2>
            <p className="text-base text-gray-300 max-w-2xl mx-auto">
              Dreams begin with learning, careers start with practice.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Main Navigation Bar - Similar to Chinese website */}
    <div className="sticky top-16 z-10 bg-[#12131A] border-b border-red-900/30 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-4 gap-4 no-scrollbar">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Study Resources</span>
          </button>
          <button className="px-4 py-2 bg-black/30 text-gray-400 rounded-lg hover:bg-black/50 transition-colors whitespace-nowrap flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span>Video Lectures</span>
          </button>
          <button className="px-4 py-2 bg-black/30 text-gray-400 rounded-lg hover:bg-black/50 transition-colors whitespace-nowrap flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Theory Texts</span>
          </button>
          <button className="px-4 py-2 bg-black/30 text-gray-400 rounded-lg hover:bg-black/50 transition-colors whitespace-nowrap flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Study Groups</span>
          </button>
        </div>
      </div>
    </div>

    {/* Search Bar */}
    <div className="container mx-auto px-4 mb-8">
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search study materials..."
          className="w-full bg-black/50 border border-red-900/30 text-white rounded-lg pl-10 pr-4 py-3 focus:border-red-500 transition-colors"
        />
      </div>
    </div>

    {/* Content Grid - Similar to Chinese website grid layout */}
    <div className="container mx-auto px-4 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Featured Study Resources */}
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-500">Study Resources</h2>
            <Link to="/resources" className="text-sm text-red-400 hover:text-red-300">View All</Link>
          </div>
          <StudyResources />
        </div>

        {/* AI Study Path */}
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-500">AI Study Path</h2>
            <Link to="/ai-path" className="text-sm text-red-400 hover:text-red-300">Customize</Link>
          </div>
          <StudyPathAI />
        </div>

        {/* Concept Analysis */}
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-500">Key Concepts</h2>
            <Link to="/concepts" className="text-sm text-red-400 hover:text-red-300">Explore More</Link>
          </div>
          <ConceptAnalysis />
        </div>

        {/* Study Milestones */}
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-500">Your Progress</h2>
            <Link to="/milestones" className="text-sm text-red-400 hover:text-red-300">View Details</Link>
          </div>
          <StudyMilestones />
        </div>
      </div>

      {/* Video Section - Similar to Chinese website */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-red-500 mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-red-600 inline-block mr-2"></span>
          Theory Videos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden border border-red-900/30 hover:border-red-600/60 transition-colors">
              <div className="aspect-video bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-600/80 flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Marxist Theory Lecture {item}</h3>
                <p className="text-sm text-gray-400">Understanding the fundamental concepts of Marxist theory and their application in modern society.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default StudyPage;