import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, BookOpen, Flame, Target, Clock, Grid, Filter, ChevronRight, GitBranch, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studyApiService } from '../components/Knowledge/api/study';
import ProgressHeader from '../components/Knowledge/Study/ProgressHeader';
import QuizPlayer from '../components/Knowledge/Study/QuizPlayer';
import CellLeaderboard from '../components/Knowledge/Study/CellLeaderboard';
import ScenarioPlayer from '../components/Knowledge/Study/ScenarioPlayer';
import MasteryTree from '../components/Knowledge/Study/MasteryTree';
import * as s from './KnowledgeStudyPage.css.ts';

const KnowledgeStudyPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [userCell, setUserCell] = useState(null);
  const [todaysChallenge, setTodaysChallenge] = useState(null);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [showQuizPlayer, setShowQuizPlayer] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [activeTab, setActiveTab] = useState('daily'); // daily, catalogue, scenarios, mastery
  const [filterType, setFilterType] = useState('all'); // all, standard, weekly
  const [showScenarioPlayer, setShowScenarioPlayer] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [progressData, cellData, challengeData, completedData, quizzesData, scenariosData] = await Promise.all([
        studyApiService.getUserProgress(user.id),
        studyApiService.getUserCell(user.id),
        studyApiService.getTodaysChallenge(),
        studyApiService.hasCompletedTodaysChallenge(user.id),
        studyApiService.getAllQuizzes(),
        studyApiService.getAllScenarios()
      ]);

      setProgress(progressData);
      setUserCell(cellData);
      setTodaysChallenge(challengeData);
      setHasCompletedToday(completedData);
      setAllQuizzes(quizzesData);
      setScenarios(scenariosData);
    } catch (err) {
      console.error('Error fetching study data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizPlayer(true);
  };

  const handleQuizComplete = () => {
    setShowQuizPlayer(false);
    setSelectedQuiz(null);
    fetchData(); // Refresh data
  };

  const handleCloseQuiz = () => {
    setShowQuizPlayer(false);
    setSelectedQuiz(null);
  };

  const handleStartScenario = (scenario) => {
    setSelectedScenario(scenario);
    setShowScenarioPlayer(true);
  };

  const handleScenarioComplete = (xpEarned) => {
    setShowScenarioPlayer(false);
    setSelectedScenario(null);
    fetchData();
  };

  const handleCloseScenario = () => {
    setShowScenarioPlayer(false);
    setSelectedScenario(null);
  };

  const getDayTopic = () => {
    const topics = [
      { day: 'Sunday', topic: 'Review & Mixed', icon: '📚', color: 'purple' },
      { day: 'Monday', topic: 'Class Analysis', icon: '✊', color: 'red' },
      { day: 'Tuesday', topic: 'Historical Materialism', icon: '📜', color: 'amber' },
      { day: 'Wednesday', topic: 'Surplus Value', icon: '💰', color: 'green' },
      { day: 'Thursday', topic: 'Contradiction ID', icon: '⚡', color: 'blue' },
      { day: 'Friday', topic: 'Praxis Application', icon: '🔥', color: 'orange' },
      { day: 'Saturday', topic: 'Dialectics', icon: '🌀', color: 'indigo' }
    ];
    return topics[new Date().getDay()];
  };

  const dayTopic = getDayTopic();

  // Filter quizzes for catalogue
  const filteredQuizzes = allQuizzes.filter(q => {
    if (filterType === 'all') return q.quiz_type !== 'daily';
    return q.quiz_type === filterType;
  });

  const getQuizTypeLabel = (type) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      standard: 'Standard',
      survival: 'Survival'
    };
    return labels[type] || type;
  };

  const getQuizTypeColor = (type) => {
    const colors = {
      daily: 'text-orange-400 bg-orange-500/20',
      weekly: 'text-blue-400 bg-blue-500/20',
      standard: 'text-green-400 bg-green-500/20',
      survival: 'text-purple-400 bg-purple-500/20'
    };
    return colors[type] || 'text-slate-400 bg-slate-500/20';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-400',
      medium: 'text-yellow-400',
      hard: 'text-orange-400',
      expert: 'text-red-400'
    };
    return colors[difficulty] || 'text-slate-400';
  };

  if (!user) {
    return (
      <div className={s.page} style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="text-center space-y-4">
          <Zap className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Study Arena</h1>
          <p className="text-slate-400">Please log in to access the Study Arena</p>
          <Link 
            to="/login" 
            className="inline-block bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg font-bold transition-all"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      {/* Header */}
      <div className="sticky top-16 z-40 bg-[#12131A]/95 backdrop-blur border-b border-gray-800 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/knowledge" 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-500" />
                Study Arena
              </h1>
              <p className="text-xs text-slate-500">Train your revolutionary theory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Header */}
        {!loading && (
          <ProgressHeader progress={progress} userCell={userCell} />
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
              activeTab === 'daily'
                ? 'bg-red-500/20 text-red-400 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Daily Challenge
            </span>
          </button>
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
              activeTab === 'catalogue'
                ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Quiz Catalogue
            </span>
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
              activeTab === 'scenarios'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Scenarios
            </span>
          </button>
          <button
            onClick={() => setActiveTab('mastery')}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
              activeTab === 'mastery'
                ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-500'
                : 'text-slate-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Mastery Tree
            </span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* DAILY TAB CONTENT */}
            {activeTab === 'daily' && (
              <>
            {/* Today's Challenge Card */}
            <div className={`bg-gradient-to-br from-${dayTopic.color}-900/30 to-gray-900/80 border border-${dayTopic.color}-500/30 rounded-xl overflow-hidden`}>
              {/* Challenge Header */}
              <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-gray-700/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dayTopic.icon}</span>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {dayTopic.day}'s Challenge
                      </div>
                      <h2 className="text-xl font-bold text-white">{dayTopic.topic}</h2>
                    </div>
                  </div>
                  {hasCompletedToday && (
                    <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                      <Target className="w-4 h-4" />
                      Completed
                    </div>
                  )}
                </div>
              </div>

              {/* Challenge Content */}
              <div className="p-6 space-y-4">
                {todaysChallenge ? (
                  <>
                    <p className="text-slate-300">{todaysChallenge.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>{todaysChallenge.questions?.length || 5} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{todaysChallenge.time_limit_seconds || 60}s per question</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400">{todaysChallenge.xp_reward} XP</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(todaysChallenge)}
                      disabled={hasCompletedToday}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                        hasCompletedToday
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/40'
                      }`}
                    >
                      <Zap className="w-5 h-5" />
                      {hasCompletedToday ? 'Already Completed Today' : 'Start Daily Challenge'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No challenge available today. Check back tomorrow!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Weekly Schedule
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { day: 'Sun', topic: 'Review', icon: '📚' },
                  { day: 'Mon', topic: 'Class', icon: '✊' },
                  { day: 'Tue', topic: 'History', icon: '📜' },
                  { day: 'Wed', topic: 'Value', icon: '💰' },
                  { day: 'Thu', topic: 'Contra.', icon: '⚡' },
                  { day: 'Fri', topic: 'Praxis', icon: '🔥' },
                  { day: 'Sat', topic: 'Dialec.', icon: '🌀' }
                ].map((item, idx) => {
                  const isToday = new Date().getDay() === idx;
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg text-center transition-all ${
                        isToday 
                          ? 'bg-red-500/20 border border-red-500/50' 
                          : 'bg-gray-800/50 border border-gray-700/50'
                      }`}
                    >
                      <div className="text-lg mb-1">{item.icon}</div>
                      <div className={`text-[10px] font-bold ${isToday ? 'text-red-400' : 'text-slate-500'}`}>
                        {item.day}
                      </div>
                      <div className={`text-[9px] ${isToday ? 'text-red-400' : 'text-slate-600'}`}>
                        {item.topic}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coming Soon: Survival Mode */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 opacity-60">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Survival Mode</h3>
                  <p className="text-sm text-slate-500">Coming Soon - Test your limits with sudden death quizzes</p>
                </div>
              </div>
            </div>
              </>
            )}

            {/* CATALOGUE TAB CONTENT */}
            {activeTab === 'catalogue' && (
              <>
                {/* Filter Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Quizzes</option>
                      <option value="standard">Standard</option>
                      <option value="weekly">Weekly</option>
                      <option value="survival">Survival</option>
                    </select>
                  </div>
                  <span className="text-sm text-slate-500">
                    {filteredQuizzes.length} quizzes available
                  </span>
                </div>

                {/* Quiz Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredQuizzes.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No quizzes available yet.</p>
                      <p className="text-sm mt-1">Check back soon for more content!</p>
                    </div>
                  ) : (
                    filteredQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all group"
                      >
                        <div className="p-4 space-y-3">
                          {/* Quiz Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">
                                {quiz.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {quiz.description || 'Test your knowledge'}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${getQuizTypeColor(quiz.quiz_type)}`}>
                              {getQuizTypeLabel(quiz.quiz_type)}
                            </span>
                          </div>

                          {/* Quiz Stats */}
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{quiz.question_count} questions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{quiz.time_limit_seconds}s</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getDifficultyColor(quiz.difficulty)}`}>
                              <Target className="w-3.5 h-3.5" />
                              <span className="capitalize">{quiz.difficulty}</span>
                            </div>
                          </div>

                          {/* XP & Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                            <div className="flex items-center gap-1 text-orange-400">
                              <Flame className="w-4 h-4" />
                              <span className="font-bold">{quiz.xp_reward} XP</span>
                            </div>
                            <button
                              onClick={() => handleStartQuiz(quiz)}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              <span>Start</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* SCENARIOS TAB CONTENT */}
            {activeTab === 'scenarios' && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-purple-400" />
                      Historical Scenarios
                    </h3>
                    <span className="text-sm text-slate-500">
                      {scenarios.length} available
                    </span>
                  </div>

                  {scenarios.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-gray-900/50 border border-gray-700 rounded-xl">
                      <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No scenarios available yet.</p>
                      <p className="text-sm mt-1">Check back soon for interactive historical adventures!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {scenarios.map(scenario => (
                        <div
                          key={scenario.id}
                          className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-bold group-hover:text-purple-400 transition-colors">
                                  {scenario.title}
                                </h4>
                                {scenario.setting && (
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {scenario.setting} {scenario.era && `(${scenario.era})`}
                                  </p>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded ${getDifficultyColor(scenario.difficulty)} bg-gray-800`}>
                                {scenario.difficulty}
                              </span>
                            </div>

                            {scenario.description && (
                              <p className="text-sm text-slate-400 line-clamp-2">
                                {scenario.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  ~{scenario.estimated_minutes} min
                                </span>
                                <span className="flex items-center gap-1 text-orange-400">
                                  <Flame className="w-3.5 h-3.5" />
                                  {scenario.xp_reward} XP
                                </span>
                              </div>
                              <button
                                onClick={() => handleStartScenario(scenario)}
                                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              >
                                <span>Play</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* MASTERY TAB CONTENT */}
            {activeTab === 'mastery' && (
              <MasteryTree onConceptSelect={(concept) => console.log('Selected concept:', concept)} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cell Leaderboard */}
            <CellLeaderboard 
              userId={user?.id} 
              userCell={userCell}
              onCellChange={fetchData}
            />

            {/* Quick Stats */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-white">Your Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total XP</span>
                  <span className="text-white font-medium">{progress?.total_xp || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Streak</span>
                  <span className="text-orange-400 font-medium">{progress?.current_streak || 0} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Longest Streak</span>
                  <span className="text-white font-medium">{progress?.longest_streak || 0} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Player Modal */}
      {showQuizPlayer && selectedQuiz && (
        <QuizPlayer
          quiz={selectedQuiz}
          userId={user?.id}
          onComplete={handleQuizComplete}
          onClose={handleCloseQuiz}
        />
      )}

      {/* Scenario Player Modal */}
      {showScenarioPlayer && selectedScenario && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-4 pt-20">
            <ScenarioPlayer
              scenario={selectedScenario}
              onBack={handleCloseScenario}
              onComplete={handleScenarioComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeStudyPage;
