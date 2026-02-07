import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { Search, ChevronRight, BookOpen, Globe, Users, Scale, Landmark, Flag } from 'lucide-react';

const PoliticsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'analysis', name: 'Political Analysis', icon: Scale },
    { id: 'movements', name: 'Movements', icon: Users },
    { id: 'international', name: 'International', icon: Flag },
    { id: 'theory', name: 'Political Theory', icon: Landmark },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('politics_articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        if (activeCategory !== 'all') {
          query = query.eq('category', activeCategory);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        setArticles(data || []);
      } catch (err) {
        console.error('Error fetching politics articles:', err);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#12131A]">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-red-900/20 to-[#12131A] pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">政治</h1>
          <h2 className="text-3xl font-bold text-red-500 mb-4">Politics</h2>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Current world events analyzed by Marxists
          </p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="sticky top-16 z-10 bg-[#12131A] border-b border-red-900/30 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-4 gap-4 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 ${
                  activeCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-black/30 text-gray-400 hover:bg-black/50'
                } rounded-lg transition-colors whitespace-nowrap flex items-center gap-2`}
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
            placeholder="Search political articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-red-900/30 text-white rounded-lg pl-10 pr-4 py-3 focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="text-center text-white py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30 hover:border-red-600/60 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-red-500 text-sm capitalize">{article.category}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">{article.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                <Link
                  to={`/politics/${article.slug || article.id}`}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center"
                >
                  Read more <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliticsPage;
