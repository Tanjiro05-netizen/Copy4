import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StudyResources from "../components/StudyPage/StudyResources";
import StudyMilestones from "../components/StudyPage/StudyMilestones";
import StudyPathAI from "../components/StudyPage/StudyPathAI";
import marxBackground from '../assets/Marx.jpg';
import ConceptAnalysis from "../components/StudyPage/ConceptAnalysis";
import Header from "../components/Header";
import { BookOpen, Video, FileText, Users, Search, Sparkles, ChevronRight, Settings } from "lucide-react";
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';


const StudyPage = () => {
  const { user, canManageStudy } = useAuth();
  const showAdminLink = canManageStudy();

  const [resources, setResources] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingConcepts, setLoadingConcepts] = useState(true);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNavTab, setActiveNavTab] = useState('Resources');

  useEffect(() => {
    const fetchResources = async () => {
      setLoadingResources(true);
      try {
        const { data, error } = await supabase
          .from('study_resources')
          .select('*')
          .order('sort_order');
        if (error) throw error;
        setResources(data || []);
      } catch (err) {
        console.error('Error fetching study resources:', err);
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const fetchConcepts = async () => {
      setLoadingConcepts(true);
      try {
        const { data, error } = await supabase
          .from('study_concepts')
          .select('*')
          .order('sort_order');
        if (error) throw error;
        setConcepts(data || []);
      } catch (err) {
        console.error('Error fetching study concepts:', err);
      } finally {
        setLoadingConcepts(false);
      }
    };
    fetchConcepts();
  }, []);

  useEffect(() => {
    const fetchMilestones = async () => {
      setLoadingMilestones(true);
      try {
        const { data: milestoneData, error: milestoneError } = await supabase
          .from('study_milestones')
          .select('*')
          .order('sort_order');
        if (milestoneError) throw milestoneError;
        setMilestones(milestoneData || []);

        if (user && user.id !== 'dev-admin') {
          const { data: progressData, error: progressError } = await supabase
            .from('study_user_progress')
            .select('*')
            .eq('user_id', user.id);
          if (progressError) throw progressError;

          const progressMap = {};
          (progressData || []).forEach((row) => {
            progressMap[row.milestone_id] = row;
          });
          setUserProgress(progressMap);
        }
      } catch (err) {
        console.error('Error fetching study milestones:', err);
      } finally {
        setLoadingMilestones(false);
      }
    };
    fetchMilestones();
  }, [user]);

  const handleToggleMilestone = useCallback(async (milestoneId, shouldComplete) => {
    if (!user || user.id === 'dev-admin') return;

    const now = new Date().toISOString();

    try {
      if (shouldComplete) {
        const { error } = await supabase
          .from('study_user_progress')
          .upsert({
            user_id: user.id,
            milestone_id: milestoneId,
            completed: true,
            completed_at: now,
          }, { onConflict: 'user_id,milestone_id' });
        if (error) throw error;

        setUserProgress((prev) => ({
          ...prev,
          [milestoneId]: { ...prev[milestoneId], completed: true, completed_at: now },
        }));
      } else {
        const { error } = await supabase
          .from('study_user_progress')
          .update({ completed: false, completed_at: null })
          .eq('user_id', user.id)
          .eq('milestone_id', milestoneId);
        if (error) throw error;

        setUserProgress((prev) => ({
          ...prev,
          [milestoneId]: { ...prev[milestoneId], completed: false, completed_at: null },
        }));
      }
    } catch (err) {
      console.error('Error toggling milestone:', err);
    }
  }, [user]);

  const filteredResources = useMemo(() => {
    let filtered = resources;

    if (activeNavTab !== 'Resources') {
      const typeMap = { Lectures: 'lecture', Texts: 'text', Groups: null };
      const targetType = typeMap[activeNavTab];
      if (targetType) {
        filtered = filtered.filter((r) => r.type === targetType);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((r) =>
        `${r.title} ${r.excerpt || ''} ${r.author || ''} ${r.category || ''}`.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activeNavTab, resources, searchQuery]);

  return (
  <div className="min-h-screen bg-[#0a0b10] text-gray-200 font-sans selection:bg-red-900 selection:text-white">
    {/* Background Elements */}
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.03)_0%,transparent_70%)]"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-950/20 to-transparent opacity-50"></div>
    </div>

    {/* Hero Banner Section */}
    <div className="relative min-h-[45vh] flex flex-col">
      {/* Background Image with improved overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={marxBackground}
          alt="Study background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 scale-105 transform transition-transform duration-[20s] hover:scale-110"
          style={{
            filter: 'brightness(0.6) contrast(1.1) grayscale(0.3)',
            mixBlendMode: 'overlay'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b10]/80 via-[#0a0b10]/60 to-[#0a0b10]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-20">
        <Header />
      </div>
      
      <div className="relative flex-1 flex items-center justify-center pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-500/30 text-red-300 text-xs font-medium tracking-wider uppercase backdrop-blur-sm animate-fade-in">
            <Sparkles className="w-3 h-3" />
            <span>Revolutionary Theory Center</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
              Study Center
            </h1>
            <p className="text-xl md:text-2xl text-red-500/80 font-serif italic">
              "Without revolutionary theory there can be no revolutionary movement."
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl focus-within:border-red-500/50 focus-within:ring-1 focus-within:ring-red-500/50 transition-all duration-300">
                <Search className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search theories, concepts, or resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 text-base px-4 py-2"
                />
                <button
                  type="button"
                  onClick={() => setActiveNavTab('Resources')}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg shadow-red-900/20"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Main Navigation Bar */}
    <div className="sticky top-0 z-30 backdrop-blur-md bg-[#0a0b10]/80 border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-4 gap-2 md:gap-4 no-scrollbar md:justify-center">
          {[
            { icon: BookOpen, label: "Resources" },
            { icon: Video, label: "Lectures" },
            { icon: FileText, label: "Texts" },
            { icon: Users, label: "Groups" }
          ].map((item) => (
            <button 
              key={item.label}
              type="button"
              onClick={() => setActiveNavTab(item.label)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap flex items-center gap-2 border ${
                activeNavTab === item.label
                  ? "bg-red-600/10 text-red-400 border-red-500/30" 
                  : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
          {showAdminLink && (
            <Link
              to="/admin/study"
              className="px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap flex items-center gap-2 border bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white ml-auto"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </div>

    {/* Content Grid */}
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - AI & Progress (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Study Path */}
          <div className="bg-[#13141c] rounded-2xl border border-white/5 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">AI Assistant</h2>
                    <p className="text-xs text-gray-400">Personalized Guidance</p>
                  </div>
                </div>
                <Link to="/ai-path" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <StudyPathAI milestones={milestones} resources={resources} userProgress={userProgress} />
            </div>
          </div>

          {/* Progress / Milestones */}
          <div className="bg-[#13141c] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
             <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">Current Progress</h2>
                <Link to="/milestones" className="text-xs text-red-400 hover:text-red-300 uppercase tracking-wider font-medium">Details</Link>
              </div>
              <StudyMilestones
                milestones={milestones}
                userProgress={userProgress}
                loading={loadingMilestones}
                onToggle={handleToggleMilestone}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Resources & Concepts (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Study Resources Section */}
          <div className="bg-[#13141c]/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6 md:p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Study Resources</h2>
                <p className="text-gray-400 text-sm">Curated materials for your theoretical development</p>
              </div>
              <Link to="/digital-library" className="hidden md:flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors group">
                View All Library <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <StudyResources resources={filteredResources} loading={loadingResources} />
          </div>

          {/* Key Concepts Section */}
          <div className="bg-[#13141c]/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Key Concepts</h2>
                <p className="text-gray-400 text-sm">Core theoretical frameworks explained</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ConceptAnalysis concepts={concepts} loading={loadingConcepts} />
            </div>
          </div>

          {/* Video Lectures Preview */}
          {resources.filter((r) => r.type === 'video' || r.type === 'lecture').length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Latest Lectures</h2>
              <button type="button" onClick={() => setActiveNavTab('Lectures')} className="text-sm text-red-400 hover:text-white transition-colors">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resources.filter((r) => r.type === 'video' || r.type === 'lecture').slice(0, 3).map((item) => (
                <a key={item.id} href={item.content_url || '#'} target="_blank" rel="noopener noreferrer" className="group cursor-pointer">
                  <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/5 relative mb-3 group-hover:border-red-500/30 transition-all duration-300">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{item.author || 'Study Center'}</p>
                </a>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default StudyPage;