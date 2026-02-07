import React, { useState } from 'react';
import Header from '../components/Header';
import NetworkAnimation from '../components/NetworkAnimation';
import CourseBrowser from '../components/ScienceTech/CourseBrowser';
import TextbookBrowser from '../components/ScienceTech/TextbookBrowser';
import NewsFeed from '../components/ScienceTech/NewsFeed';
import { GraduationCap, BookOpen, Newspaper } from 'lucide-react';

const tabs = [
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'textbooks', label: 'Textbooks', icon: BookOpen },
  { id: 'news', label: 'News', icon: Newspaper },
];

const ScienceTechPage = () => {
  const [activeTab, setActiveTab] = useState('courses');

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseBrowser />;
      case 'textbooks':
        return <TextbookBrowser />;
      case 'news':
        return <NewsFeed />;
      default:
        return <CourseBrowser />;
    }
  };

  return (
    <div className="min-h-screen bg-[#12131A] overflow-y-auto">
      {/* Hero Banner with Animated Network Background */}
      <div className="relative bg-[#12131A] min-h-[40vh] overflow-hidden">
        <NetworkAnimation />
        <Header />
        <div className="relative pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">科学技术</h1>
              <h2 className="text-3xl font-bold text-red-500 mb-4">Science & Technology</h2>
              <p className="text-base text-gray-300 max-w-2xl mx-auto">
                Master the fundamentals of physics, chemistry, mathematics, computer science, and medicine through interactive courses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-16 z-10 bg-[#12131A]/95 backdrop-blur-sm border-b border-red-900/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                      : 'bg-black/20 text-gray-400 hover:bg-black/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default ScienceTechPage;
