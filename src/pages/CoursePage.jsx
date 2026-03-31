import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  ArrowLeft, Clock, BookOpen, BarChart2, Check, Lock, 
  ChevronDown, ChevronRight, Play, FileText, HelpCircle,
  Award, Zap
} from 'lucide-react';
import CertificateViewer from '../components/ScienceTech/CertificateViewer';
import * as s from './CoursePage.css.ts';

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'text-green-400', bg: 'bg-green-400/10' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  advanced: { label: 'Advanced', color: 'text-red-400', bg: 'bg-red-400/10' },
};

const lessonTypeIcons = {
  video: Play,
  reading: FileText,
  exercise: HelpCircle,
  quiz: HelpCircle,
};

const CoursePage = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [user, setUser] = useState(null);
  const [testAttempts, setTestAttempts] = useState({});
  const [certificate, setCertificate] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseSlug]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('stem_courses')
        .select('*, stem_subjects(name, slug, color, icon_name)')
        .eq('slug', courseSlug)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch chapters with lessons
      const { data: chaptersData } = await supabase
        .from('stem_chapters')
        .select(`
          *,
          stem_lessons(id, title, slug, lesson_type, xp_reward, order_index),
          stem_chapter_tests(id, title, passing_score)
        `)
        .eq('course_id', courseData.id)
        .order('order_index');

      // Sort lessons within each chapter
      const sortedChapters = (chaptersData || []).map(chapter => ({
        ...chapter,
        stem_lessons: (chapter.stem_lessons || []).sort((a, b) => a.order_index - b.order_index)
      }));
      setChapters(sortedChapters);

      // Expand first chapter by default
      if (sortedChapters.length > 0) {
        setExpandedChapters({ [sortedChapters[0].id]: true });
      }

      // Fetch enrollment and progress if logged in
      if (currentUser) {
        const { data: enrollmentData } = await supabase
          .from('stem_enrollments')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('course_id', courseData.id)
          .single();
        setEnrollment(enrollmentData);

        // Fetch lesson progress
        const allLessonIds = sortedChapters.flatMap(ch => ch.stem_lessons.map(l => l.id));
        if (allLessonIds.length > 0) {
          const { data: progressData } = await supabase
            .from('stem_lesson_progress')
            .select('lesson_id, completed_at')
            .eq('user_id', currentUser.id)
            .in('lesson_id', allLessonIds);

          const progressMap = {};
          (progressData || []).forEach(p => {
            progressMap[p.lesson_id] = p.completed_at ? 'completed' : 'started';
          });
          setLessonProgress(progressMap);
        }

        // Fetch test attempts (best per test)
        const allTestIds = sortedChapters
          .flatMap(ch => (ch.stem_chapter_tests || []).map(t => t.id))
          .filter(Boolean);
        if (allTestIds.length > 0) {
          const { data: attemptsData } = await supabase
            .from('stem_test_attempts')
            .select('test_id, score, passed')
            .eq('user_id', currentUser.id)
            .in('test_id', allTestIds)
            .order('score', { ascending: false });

          const attemptsMap = {};
          (attemptsData || []).forEach(a => {
            if (!attemptsMap[a.test_id] || a.score > attemptsMap[a.test_id].score) {
              attemptsMap[a.test_id] = a;
            }
          });
          setTestAttempts(attemptsMap);
        }

        // Fetch certificate if exists
        const { data: certData } = await supabase
          .from('stem_certificates')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('course_id', courseData.id)
          .single();
        if (certData) setCertificate(certData);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/science-tech/courses/${courseSlug}` } });
      return;
    }

    setIsEnrolling(true);
    try {
      const { data, error } = await supabase
        .from('stem_enrollments')
        .insert({ user_id: user.id, course_id: course.id })
        .select()
        .single();

      if (error) throw error;
      setEnrollment(data);
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const getChapterProgress = (chapter) => {
    const lessons = chapter.stem_lessons || [];
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => lessonProgress[l.id] === 'completed').length;
    return Math.round((completed / lessons.length) * 100);
  };

  const getTotalProgress = () => {
    const allLessons = chapters.flatMap(ch => ch.stem_lessons || []);
    if (allLessons.length === 0) return 0;
    const completed = allLessons.filter(l => lessonProgress[l.id] === 'completed').length;
    return Math.round((completed / allLessons.length) * 100);
  };

  const getTotalXP = () => {
    return chapters.flatMap(ch => ch.stem_lessons || [])
      .reduce((sum, l) => sum + (l.xp_reward || 0), 0);
  };

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.loadingWrap}>Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={s.page}>
        <div className={s.notFoundWrap}>
          <p className={s.notFoundText}>Course not found</p>
          <Link to="/science-tech" className={s.notFoundLink}>
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const difficulty = difficultyConfig[course.difficulty] || difficultyConfig.beginner;

  return (
    <div className={s.page}>
      
      {/* Hero Section */}
      <div 
        className="pt-20 pb-12 px-4"
        style={{ 
          background: `linear-gradient(180deg, ${course.stem_subjects?.color}15 0%, transparent 100%)` 
        }}
      >
        <div className="container mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <Link 
            to="/science-tech" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Course Info */}
            <div className="flex-1">
              {/* Subject Badge */}
              {course.stem_subjects && (
                <span 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                  style={{ backgroundColor: course.stem_subjects.color }}
                >
                  {course.stem_subjects.name}
                </span>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {course.title}
              </h1>

              <p className="text-gray-300 text-lg mb-6">
                {course.description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                <span className={`px-3 py-1 rounded ${difficulty.bg} ${difficulty.color} text-sm font-medium`}>
                  {difficulty.label}
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <BookOpen className="w-4 h-4" />
                  {chapters.length} chapters
                </span>
                {course.estimated_hours && (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    ~{course.estimated_hours} hours
                  </span>
                )}
                <span className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Zap className="w-4 h-4" />
                  {getTotalXP()} XP
                </span>
              </div>

              {/* Enroll Button */}
              {!enrollment ? (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isEnrolling ? 'Enrolling...' : 'Enroll for Free'}
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">{getTotalProgress()}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${getTotalProgress()}%` }}
                      />
                    </div>
                  </div>
                  {getTotalProgress() === 100 && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                        <Award className="w-5 h-5" />
                        Completed!
                      </span>
                      {certificate && (
                        <button
                          onClick={() => setShowCertificate(true)}
                          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                        >
                          View Certificate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* What You'll Learn Card */}
            {course.what_youll_learn && course.what_youll_learn.length > 0 && (
              <div className="lg:w-80 bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-red-900/30">
                <h3 className="text-lg font-bold text-white mb-4">What you'll learn</h3>
                <ul className="space-y-3">
                  {course.what_youll_learn.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>

        <div className="space-y-4">
          {chapters.map((chapter, chapterIdx) => {
            const isExpanded = expandedChapters[chapter.id];
            const chapterProgress = getChapterProgress(chapter);
            const lessons = chapter.stem_lessons || [];
            const test = chapter.stem_chapter_tests?.[0];

            return (
              <div 
                key={chapter.id}
                className="bg-black/40 backdrop-blur-lg rounded-xl border border-red-900/30 overflow-hidden"
              >
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-black/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      chapterProgress === 100 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {chapterProgress === 100 ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="font-bold">{chapterIdx + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{chapter.title}</h3>
                      <p className="text-gray-500 text-sm">
                        {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                        {test && ' • Chapter Test'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${chapterProgress}%` }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs w-8">{chapterProgress}%</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Chapter Content */}
                {isExpanded && (
                  <div className="border-t border-gray-800">
                    {lessons.map((lesson, lessonIdx) => {
                      const Icon = lessonTypeIcons[lesson.lesson_type] || FileText;
                      const status = lessonProgress[lesson.id];
                      const isLocked = !enrollment && lessonIdx > 0;

                      return (
                        <Link
                          key={lesson.id}
                          to={enrollment || lessonIdx === 0 
                            ? `/science-tech/courses/${courseSlug}/${chapter.slug}/${lesson.slug}`
                            : '#'
                          }
                          onClick={(e) => {
                            if (isLocked) {
                              e.preventDefault();
                              handleEnroll();
                            }
                          }}
                          className={`flex items-center gap-4 p-4 pl-8 border-b border-gray-800/50 last:border-b-0 transition-colors ${
                            isLocked 
                              ? 'opacity-50 cursor-pointer' 
                              : 'hover:bg-black/20'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            status === 'completed' 
                              ? 'bg-green-500/20 text-green-400'
                              : status === 'started'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-800 text-gray-500'
                          }`}>
                            {isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : status === 'completed' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm ${status === 'completed' ? 'text-gray-400' : 'text-white'}`}>
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500 text-xs">+{lesson.xp_reward} XP</span>
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          </div>
                        </Link>
                      );
                    })}

                    {/* Chapter Test */}
                    {test && (
                      <Link
                        to={enrollment ? `/science-tech/courses/${courseSlug}/${chapter.slug}/test` : '#'}
                        onClick={(e) => {
                          if (!enrollment) {
                            e.preventDefault();
                            handleEnroll();
                          }
                        }}
                        className="flex items-center gap-4 p-4 pl-8 bg-purple-900/10 border-t border-purple-900/30 hover:bg-purple-900/20 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          testAttempts[test.id]?.passed
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {testAttempts[test.id]?.passed 
                            ? <Check className="w-4 h-4" />
                            : <HelpCircle className="w-4 h-4" />
                          }
                        </div>
                        <div className="flex-1">
                          <span className="text-white text-sm">{test.title}</span>
                          <p className="text-gray-500 text-xs">
                            {testAttempts[test.id]
                              ? `Best: ${testAttempts[test.id].score}% — ${testAttempts[test.id].passed ? 'Passed ✓' : 'Not passed'}`
                              : `Pass with ${test.passing_score}% to continue`
                            }
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Certificate Viewer */}
      {showCertificate && certificate && (
        <CertificateViewer
          certificate={certificate}
          course={course}
          user={user}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default CoursePage;
