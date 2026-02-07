import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { studyApiService } from '../api/study';
import { 
  Lock, CheckCircle, BookOpen, ChevronRight, 
  Loader2, Star, Zap, Info, X
} from 'lucide-react';

const MASTERY_LEVELS = {
  0: { label: 'Locked', color: 'gray', icon: Lock },
  1: { label: 'Learning', color: 'yellow', icon: BookOpen },
  2: { label: 'Practiced', color: 'blue', icon: Zap },
  3: { label: 'Mastered', color: 'green', icon: CheckCircle }
};

const CATEGORY_COLORS = {
  yellow: 'from-yellow-600 to-amber-700',
  orange: 'from-orange-600 to-red-700',
  purple: 'from-purple-600 to-indigo-700',
  red: 'from-red-600 to-rose-700',
  rose: 'from-rose-600 to-pink-700',
  blue: 'from-blue-600 to-cyan-700',
  green: 'from-green-600 to-emerald-700'
};

const MasteryTree = ({ onConceptSelect }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [userMastery, setUserMastery] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, conceptsData] = await Promise.all([
        studyApiService.getConceptCategories(),
        studyApiService.getConceptsWithPrerequisites()
      ]);
      
      setCategories(categoriesData);
      setConcepts(conceptsData);
      
      if (user) {
        const masteryData = await studyApiService.getUserConceptMastery(user.id);
        const masteryMap = {};
        masteryData.forEach(m => {
          masteryMap[m.concept_id] = m;
        });
        setUserMastery(masteryMap);
      }
      
      // Auto-expand first category
      if (categoriesData.length > 0) {
        setExpandedCategory(categoriesData[0].id);
      }
    } catch (err) {
      console.error('Error loading mastery tree:', err);
    }
    setLoading(false);
  };

  const getConceptMasteryLevel = (conceptId) => {
    return userMastery[conceptId]?.mastery_level || 0;
  };

  const isConceptUnlocked = (concept) => {
    if (!concept.prerequisite_ids || concept.prerequisite_ids.length === 0) {
      return true; // No prerequisites = always unlocked
    }
    
    // All prerequisites must be at least level 1
    return concept.prerequisite_ids.every(prereqId => {
      const prereqMastery = getConceptMasteryLevel(prereqId);
      return prereqMastery >= 1;
    });
  };

  const getConceptsByCategory = (categoryId) => {
    return concepts.filter(c => c.category_id === categoryId);
  };

  const getTotalMastered = (categoryId) => {
    const categoryConcepts = getConceptsByCategory(categoryId);
    return categoryConcepts.filter(c => getConceptMasteryLevel(c.id) >= 3).length;
  };

  const handleConceptClick = (concept) => {
    if (isConceptUnlocked(concept)) {
      setSelectedConcept(concept);
    }
  };

  const handleStartLearning = async (concept) => {
    if (!user) return;
    
    const currentLevel = getConceptMasteryLevel(concept.id);
    if (currentLevel === 0) {
      // Unlock the concept
      await studyApiService.updateConceptMastery(user.id, concept.id, {
        mastery_level: 1
      });
      
      setUserMastery(prev => ({
        ...prev,
        [concept.id]: { ...prev[concept.id], mastery_level: 1, concept_id: concept.id }
      }));
    }
    
    setSelectedConcept(null);
    onConceptSelect?.(concept);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Concept Mastery Tree
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Master concepts to unlock advanced topics
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {Object.values(userMastery).filter(m => m.mastery_level >= 3).length}
          </div>
          <div className="text-xs text-gray-500">Concepts Mastered</div>
        </div>
      </div>

      {/* Category Branches */}
      <div className="space-y-3">
        {categories.map(category => {
          const categoryConcepts = getConceptsByCategory(category.id);
          const mastered = getTotalMastered(category.id);
          const isExpanded = expandedCategory === category.id;
          const colorClass = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.red;
          
          return (
            <div key={category.id} className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center text-xl`}>
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{mastered}/{categoryConcepts.length}</span>
                    <span className="text-xs text-gray-500 ml-1">mastered</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {/* Concepts Grid */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categoryConcepts.map(concept => {
                      const masteryLevel = getConceptMasteryLevel(concept.id);
                      const unlocked = isConceptUnlocked(concept);
                      const masteryInfo = MASTERY_LEVELS[masteryLevel];
                      const MasteryIcon = masteryInfo.icon;
                      
                      return (
                        <button
                          key={concept.id}
                          onClick={() => handleConceptClick(concept)}
                          disabled={!unlocked}
                          className={`relative p-3 rounded-lg text-left transition-all ${
                            unlocked
                              ? masteryLevel >= 3
                                ? 'bg-green-900/30 border border-green-500/30 hover:border-green-500/50'
                                : masteryLevel >= 1
                                  ? 'bg-blue-900/30 border border-blue-500/30 hover:border-blue-500/50'
                                  : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                              : 'bg-gray-800/30 border border-gray-800 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                unlocked ? 'text-white' : 'text-gray-500'
                              }`}>
                                {concept.name}
                              </p>
                              <p className={`text-[10px] mt-0.5 ${
                                masteryInfo.color === 'green' ? 'text-green-400' :
                                masteryInfo.color === 'blue' ? 'text-blue-400' :
                                masteryInfo.color === 'yellow' ? 'text-yellow-400' :
                                'text-gray-500'
                              }`}>
                                {masteryInfo.label}
                              </p>
                            </div>
                            <MasteryIcon className={`w-4 h-4 flex-shrink-0 ${
                              masteryInfo.color === 'green' ? 'text-green-400' :
                              masteryInfo.color === 'blue' ? 'text-blue-400' :
                              masteryInfo.color === 'yellow' ? 'text-yellow-400' :
                              'text-gray-600'
                            }`} />
                          </div>
                          
                          {/* Difficulty dots */}
                          <div className="flex gap-0.5 mt-2">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  i <= concept.difficulty
                                    ? 'bg-red-500'
                                    : 'bg-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Concept Detail Modal */}
      {selectedConcept && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                  CATEGORY_COLORS[selectedConcept.category?.color] || CATEGORY_COLORS.red
                } flex items-center justify-center`}>
                  {selectedConcept.icon || selectedConcept.category?.icon || '📖'}
                </div>
                <div>
                  <h3 className="font-bold text-white">{selectedConcept.name}</h3>
                  <p className="text-xs text-gray-500">{selectedConcept.category?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConcept(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-2">Overview</h4>
                <p className="text-gray-300 text-sm">{selectedConcept.description}</p>
              </div>

              {/* Detailed Explanation */}
              {selectedConcept.detailed_explanation && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 mb-2">Detailed Explanation</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {selectedConcept.detailed_explanation}
                  </p>
                </div>
              )}

              {/* Key Theorists */}
              {selectedConcept.key_theorists?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 mb-2">Key Theorists</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConcept.key_theorists.map((theorist, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                        {theorist}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Works */}
              {selectedConcept.key_works?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 mb-2">Key Works</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConcept.key_works.map((work, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 italic">
                        {work}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {selectedConcept.prerequisite_ids?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 mb-2">Prerequisites</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConcept.prerequisite_ids.map(prereqId => {
                      const prereq = concepts.find(c => c.id === prereqId);
                      const prereqLevel = getConceptMasteryLevel(prereqId);
                      return prereq ? (
                        <span 
                          key={prereqId} 
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                            prereqLevel >= 1 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {prereqLevel >= 1 && <CheckCircle className="w-3 h-3" />}
                          {prereq.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* XP Value */}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-400">XP for Mastery</span>
                <span className="font-bold text-orange-400">{selectedConcept.xp_value} XP</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleStartLearning(selectedConcept)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                {getConceptMasteryLevel(selectedConcept.id) === 0 ? (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Start Learning
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Continue Learning
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-800">
        {Object.entries(MASTERY_LEVELS).map(([level, info]) => {
          const Icon = info.icon;
          return (
            <div key={level} className="flex items-center gap-1.5 text-xs text-gray-500">
              <Icon className={`w-3.5 h-3.5 ${
                info.color === 'green' ? 'text-green-400' :
                info.color === 'blue' ? 'text-blue-400' :
                info.color === 'yellow' ? 'text-yellow-400' :
                'text-gray-600'
              }`} />
              <span>{info.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MasteryTree;
