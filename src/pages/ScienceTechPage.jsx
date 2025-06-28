import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import NetworkAnimation from '../components/NetworkAnimation';
import { Search, ChevronRight, ExternalLink, BookOpen, Database, Rocket, Microscope, Atom, Cpu, Globe } from 'lucide-react';

const ScienceTechPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories', icon: Database },
    { id: 'achievements', name: 'Scientific Achievements', icon: Rocket },
    { id: 'research', name: 'Research Projects', icon: Microscope },
    { id: 'theory', name: 'Scientific Theory', icon: Atom },
    { id: 'technology', name: 'Technology Development', icon: Cpu },
    { id: 'global', name: 'Global Initiatives', icon: Globe }
  ];

  // Sample data for science and technology content
  const scienceNews = [
    { id: 1, title: 'Advancements in Quantum Computing', category: 'technology', excerpt: 'Recent breakthroughs in quantum computing are revolutionizing computational capabilities...' },
    { id: 2, title: 'Sustainable Energy Research', category: 'research', excerpt: 'New developments in renewable energy sources show promising results for global implementation...' },
    { id: 3, title: 'Space Exploration Milestones', category: 'achievements', excerpt: 'Recent missions have expanded our understanding of the solar system and beyond...' },
    { id: 4, title: 'Artificial Intelligence Ethics', category: 'theory', excerpt: 'Examining the philosophical and ethical implications of advanced AI systems...' }
  ];

  const techProjects = [
    { id: 1, name: 'National Science Foundation', image: '/images/placeholder-tech.jpg' },
    { id: 2, name: 'Research Laboratories', image: '/images/placeholder-tech.jpg' },
    { id: 3, name: 'Technology Museums', image: '/images/placeholder-tech.jpg' },
    { id: 4, name: 'Innovation Centers', image: '/images/placeholder-tech.jpg' }
  ];

  return (
    <div className="min-h-screen bg-[#12131A] overflow-y-auto">
      {/* Hero Banner with Animated Network Background */}
      <div className="relative bg-[#12131A] min-h-[50vh] mb-8 overflow-hidden">
        {/* Animated Network Background */}
        <NetworkAnimation />

        <Header />

        <div className="relative pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">科学技术</h1>
              <h2 className="text-3xl font-bold text-red-500 mb-4">Science & Technology</h2>
              <p className="text-base text-gray-300 max-w-2xl mx-auto">
                Exploring scientific advancements and technological innovations through a Marxist lens.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="sticky top-16 z-10 bg-[#12131A] border-b border-red-900/30 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-4 gap-4 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 ${activeCategory === category.id ? 'bg-red-600 text-white' : 'bg-black/30 text-gray-400 hover:bg-black/50'} rounded-lg transition-colors whitespace-nowrap flex items-center gap-2`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search scientific resources..."
            className="w-full bg-black/50 border border-red-900/30 text-white rounded-lg pl-10 pr-4 py-3 focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 pb-12">
        {/* Featured Section - National Science Awards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-red-500 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-red-600 inline-block mr-2"></span>
            National Science Awards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden border border-red-900/30 hover:border-red-600/60 transition-colors">
              <div className="aspect-video bg-gray-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">National Science & Technology Awards</h3>
                  <p className="text-gray-300">Recognizing outstanding contributions to scientific advancement</p>
                </div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden border border-red-900/30 hover:border-red-600/60 transition-colors">
              <div className="aspect-video bg-gray-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Academy of Sciences</h3>
                  <p className="text-gray-300">Leading research institutions and scientific academies</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Science News Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-red-500 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-red-600 inline-block mr-2"></span>
            Science & Technology News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scienceNews.map((news) => (
              <div key={news.id} className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30 shadow-xl overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-red-500 text-sm">{news.category}</div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">{news.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{news.excerpt}</p>
                <Link to="#" className="text-red-400 hover:text-red-300 text-sm flex items-center">
                  Read more <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Museums & Research Centers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-red-500 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-red-600 inline-block mr-2"></span>
            Science & Technology Museums
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {techProjects.map((project) => (
              <div key={project.id} className="bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden border border-red-900/30 hover:border-red-600/60 transition-colors group">
                <div className="aspect-square bg-gray-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to="#" className="text-white text-sm flex items-center">
                      Visit <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Age Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-red-500 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-red-600 inline-block mr-2"></span>
            Digital Age
          </h2>
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Technological Innovation</h3>
                <p className="text-gray-400 mb-4">
                  Exploring the rapid advancement of technology and its impact on society, economy, and culture.
                </p>
                <ul className="space-y-2">
                  {['High-speed Rail', 'Artificial Intelligence', '5G Technology', 'Quantum Computing'].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Featured Research</h4>
                <div className="space-y-3">
                  {['National Research Projects', 'International Collaborations', 'Industry Partnerships', 'Academic Innovations'].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-black/40 rounded-lg transition-colors">
                      <span className="text-gray-300">{item}</span>
                      <ChevronRight className="w-4 h-4 text-red-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ScienceTechPage;