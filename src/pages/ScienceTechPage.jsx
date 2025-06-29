import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import NetworkAnimation from '../components/NetworkAnimation';
import { supabase } from '../supabaseClient';
import { Search, ChevronRight, ExternalLink, BookOpen, Database, Rocket, Microscope, Atom, Cpu, Globe } from 'lucide-react';

const iconMap = {
  Database,
  Rocket,
  Microscope,
  Atom,
  Cpu,
  Globe
};

const ScienceTechPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('sci_tech_categories')
          .select('*');
        if (categoriesError) throw categoriesError;
        const formattedCategories = categoriesData.map(c => ({ ...c, icon: iconMap[c.icon_name] || Database }));
        setCategories([{ id: 'all', name: 'All Categories', icon: Database }, ...formattedCategories]);

        // Fetch articles
        let articlesQuery = supabase.from('sci_tech_articles').select('*, sci_tech_categories(name)');
        if (searchQuery) {
          articlesQuery = articlesQuery.ilike('title', `%${searchQuery}%`);
        }
        if (activeCategory !== 'all') {
          articlesQuery = articlesQuery.eq('category_id', activeCategory);
        }
        const { data: articlesData, error: articlesError } = await articlesQuery;
        if (articlesError) throw articlesError;
        setArticles(articlesData || []);

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase.from('sci_tech_projects').select('*');
        if (projectsError) throw projectsError;
        setProjects(projectsData || []);

      } catch (error) {
        setError('Error fetching data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#12131A] overflow-y-auto">
      {/* Hero Banner with Animated Network Background */}
      <div className="relative bg-[#12131A] min-h-[50vh] mb-8 overflow-hidden">
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
                {category.icon && <category.icon className="w-4 h-4" />}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-red-900/30 text-white rounded-lg pl-10 pr-4 py-3 focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="text-center text-white py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <>
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
                {articles.map((article) => (
                  <div key={article.id} className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30 shadow-xl overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-red-500 text-sm">{article.sci_tech_categories.name}</div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </button>
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">{article.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{article.excerpt}</p>
                    <Link to={`/sci-tech/${article.id}`} className="text-red-400 hover:text-red-300 text-sm flex items-center">
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
                {projects.map((project) => (
                  <div key={project.id} className="bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden border border-red-900/30 hover:border-red-600/60 transition-colors group">
                    <div className="aspect-square bg-gray-800 relative" style={{ backgroundImage: `url(${project.image_url})`, backgroundSize: 'cover' }}>
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
          </>
        )}
      </div>
    </div>
  );
};

export default ScienceTechPage;