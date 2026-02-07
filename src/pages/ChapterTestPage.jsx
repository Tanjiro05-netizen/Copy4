import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { 
  ArrowLeft, Clock, Check, X, AlertCircle, 
  ChevronRight, Award, RotateCcw, Zap
} from 'lucide-react';

const ChapterTestPage = () => {
  const { courseSlug, chapterSlug } = useParams();
  const navigate = useNavigate();

  // Data
  const [course, setCourse] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [previousAttempt, setPreviousAttempt] = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState('intro'); // intro | taking | results
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchTestData();
  }, [courseSlug, chapterSlug]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'taking' || timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const fetchTestData = async () => {
    setIsLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Fetch course
      const { data: courseData } = await supabase
        .from('stem_courses')
        .select('*, stem_subjects(name, color)')
        .eq('slug', courseSlug)
        .single();
      setCourse(courseData);

      // Fetch chapter
      const { data: chapterData } = await supabase
        .from('stem_chapters')
        .select('*')
        .eq('course_id', courseData.id)
        .eq('slug', chapterSlug)
        .single();
      setChapter(chapterData);

      // Fetch test
      const { data: testData } = await supabase
        .from('stem_chapter_tests')
        .select('*')
        .eq('chapter_id', chapterData.id)
        .single();
      setTest(testData);

      if (testData) {
        // Fetch questions
        const { data: questionsData } = await supabase
          .from('stem_test_questions')
          .select('*')
          .eq('test_id', testData.id)
          .order('order_index');
        setQuestions(questionsData || []);

        // Fetch previous best attempt
        if (currentUser) {
          const { data: attemptData } = await supabase
            .from('stem_test_attempts')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('test_id', testData.id)
            .order('score', { ascending: false })
            .limit(1)
            .single();
          setPreviousAttempt(attemptData);
        }
      }
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = () => {
    setAnswers({});
    setResults(null);
    if (test.time_limit_minutes) {
      setTimeLeft(test.time_limit_minutes * 60);
    }
    setPhase('taking');
  };

  const setAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (isSubmitting) return;
    if (!autoSubmit && !window.confirm('Are you sure you want to submit your test?')) return;

    setIsSubmitting(true);
    try {
      // Grade the test
      let totalPoints = 0;
      let earnedPoints = 0;
      const questionResults = questions.map(q => {
        const userAnswer = answers[q.id] || '';
        const points = q.points || 1;
        totalPoints += points;

        let isCorrect = false;
        if (q.question_type === 'numeric') {
          isCorrect = parseFloat(userAnswer) === parseFloat(q.correct_answer);
        } else if (q.question_type === 'fill_blank') {
          isCorrect = userAnswer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
        } else {
          isCorrect = userAnswer === q.correct_answer;
        }

        if (isCorrect) earnedPoints += points;

        return {
          question_id: q.id,
          user_answer: userAnswer,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          points,
          explanation: q.explanation
        };
      });

      const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = scorePercent >= (test.passing_score || 70);

      // Save attempt
      if (user) {
        await supabase.from('stem_test_attempts').insert({
          user_id: user.id,
          test_id: test.id,
          score: scorePercent,
          total_points: totalPoints,
          passed,
          answers: questionResults,
          started_at: new Date(Date.now() - (test.time_limit_minutes || 0) * 60000).toISOString(),
          completed_at: new Date().toISOString()
        });

        // Award XP if passed
        if (passed) {
          const xpAmount = 25;
          await supabase.rpc('update_user_xp', { 
            p_user_id: user.id, 
            p_xp_amount: xpAmount 
          });
        }
      }

      setResults({
        score: scorePercent,
        earnedPoints,
        totalPoints,
        passed,
        questionResults
      });
      setPhase('results');
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, answers, questions, test, user]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#12131A]">
        <Header />
        <div className="pt-24 text-center text-gray-400">Loading test...</div>
      </div>
    );
  }

  // No test found
  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#12131A]">
        <Header />
        <div className="pt-24 text-center">
          <p className="text-gray-400 text-lg">No test found for this chapter</p>
          <Link to={`/science-tech/courses/${courseSlug}`} className="text-red-400 hover:text-red-300 mt-4 inline-block">
            ← Back to course
          </Link>
        </div>
      </div>
    );
  }

  // ==================
  // INTRO PHASE
  // ==================
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#12131A]">
        <Header />
        <div className="pt-24 px-4 pb-12">
          <div className="container mx-auto max-w-2xl">
            <Link 
              to={`/science-tech/courses/${courseSlug}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {course?.title}
            </Link>

            <div className="bg-black/40 rounded-xl border border-purple-900/30 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{test.title}</h1>
                <p className="text-gray-400">{chapter?.title}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Questions</span>
                  <span className="text-white font-medium">{questions.length}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Passing Score</span>
                  <span className="text-white font-medium">{test.passing_score || 70}%</span>
                </div>
                {test.time_limit_minutes && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">Time Limit</span>
                    <span className="text-white font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {test.time_limit_minutes} minutes
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">XP Reward</span>
                  <span className="text-yellow-500 font-medium flex items-center gap-1">
                    <Zap className="w-4 h-4" /> +25 XP
                  </span>
                </div>
              </div>

              {previousAttempt && (
                <div className={`rounded-lg p-4 mb-6 ${
                  previousAttempt.passed 
                    ? 'bg-green-900/20 border border-green-900/30' 
                    : 'bg-yellow-900/20 border border-yellow-900/30'
                }`}>
                  <p className={`text-sm font-medium ${previousAttempt.passed ? 'text-green-400' : 'text-yellow-400'}`}>
                    Previous best: {previousAttempt.score}% — {previousAttempt.passed ? 'Passed ✓' : 'Not passed'}
                  </p>
                </div>
              )}

              <button
                onClick={startTest}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-lg"
              >
                {previousAttempt ? 'Retake Test' : 'Start Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================
  // TAKING PHASE
  // ==================
  if (phase === 'taking') {
    const answeredCount = Object.keys(answers).length;
    const isTimeWarning = timeLeft !== null && timeLeft < 60;

    return (
      <div className="min-h-screen bg-[#12131A]">
        <Header />

        {/* Sticky top bar */}
        <div className="fixed top-16 left-0 right-0 z-10 bg-[#12131A]/95 backdrop-blur-sm border-b border-purple-900/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-white font-medium text-sm">
                {test.title}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">
                  {answeredCount}/{questions.length} answered
                </span>
                {timeLeft !== null && (
                  <span className={`font-mono text-sm font-medium flex items-center gap-1 ${
                    isTimeWarning ? 'text-red-400 animate-pulse' : 'text-white'
                  }`}>
                    <Clock className="w-4 h-4" />
                    {formatTime(timeLeft)}
                  </span>
                )}
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="pt-36 pb-12 px-4">
          <div className="container mx-auto max-w-3xl space-y-6">
            {questions.map((q, idx) => (
              <div 
                key={q.id}
                className={`bg-black/40 rounded-xl border p-6 transition-colors ${
                  answers[q.id] ? 'border-purple-900/50' : 'border-gray-800'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    answers[q.id] 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-white font-medium">{q.question}</p>
                    <span className="text-gray-600 text-xs">{q.points || 1} point{(q.points || 1) > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Multiple choice / true_false */}
                {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && q.options && (
                  <div className="space-y-2 ml-11">
                    {(Array.isArray(q.options) ? q.options : []).map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => setAnswer(q.id, option)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          answers[q.id] === option
                            ? 'border-purple-500 bg-purple-500/10 text-white'
                            : 'border-gray-700 bg-black/20 text-gray-300 hover:border-gray-600 hover:bg-black/30'
                        }`}
                      >
                        <span className="text-sm">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Numeric */}
                {q.question_type === 'numeric' && (
                  <div className="ml-11">
                    <input
                      type="number"
                      step="any"
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Fill in blank */}
                {q.question_type === 'fill_blank' && (
                  <div className="ml-11">
                    <input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================
  // RESULTS PHASE
  // ==================
  if (phase === 'results' && results) {
    return (
      <div className="min-h-screen bg-[#12131A]">
        <Header />
        <div className="pt-24 px-4 pb-12">
          <div className="container mx-auto max-w-3xl">
            {/* Score Card */}
            <div className={`rounded-xl border p-8 text-center mb-8 ${
              results.passed 
                ? 'bg-green-900/10 border-green-900/30' 
                : 'bg-red-900/10 border-red-900/30'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                results.passed ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {results.passed 
                  ? <Check className="w-10 h-10 text-green-400" />
                  : <X className="w-10 h-10 text-red-400" />
                }
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {results.score}%
              </h1>
              <p className={`text-lg font-medium ${results.passed ? 'text-green-400' : 'text-red-400'}`}>
                {results.passed ? 'Test Passed!' : 'Test Not Passed'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {results.earnedPoints}/{results.totalPoints} points • Passing: {test.passing_score || 70}%
              </p>
              {results.passed && (
                <p className="text-yellow-500 text-sm mt-2 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" /> +25 XP earned
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mb-8">
              <Link
                to={`/science-tech/courses/${courseSlug}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Link>
              {!results.passed && (
                <button
                  onClick={startTest}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Test
                </button>
              )}
            </div>

            {/* Question Review */}
            <h2 className="text-xl font-bold text-white mb-4">Question Review</h2>
            <div className="space-y-4">
              {results.questionResults.map((qr, idx) => {
                const question = questions[idx];
                return (
                  <div 
                    key={idx}
                    className={`bg-black/40 rounded-xl border p-5 ${
                      qr.is_correct ? 'border-green-900/30' : 'border-red-900/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        qr.is_correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {qr.is_correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{question?.question}</p>
                        
                        {!qr.is_correct && (
                          <div className="space-y-1 mb-3">
                            <p className="text-red-400 text-sm">
                              Your answer: {qr.user_answer || '(no answer)'}
                            </p>
                            <p className="text-green-400 text-sm">
                              Correct answer: {qr.correct_answer}
                            </p>
                          </div>
                        )}

                        {qr.explanation && (
                          <div className="bg-black/30 rounded-lg p-3 mt-2">
                            <p className="text-gray-400 text-sm flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                              {qr.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChapterTestPage;
