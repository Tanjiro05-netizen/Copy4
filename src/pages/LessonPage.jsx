import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Check, Play,
  Zap, Award
} from 'lucide-react';
import ExerciseWidget from '../components/ScienceTech/ExerciseWidget';
import BlockRenderer from '../components/ScienceTech/blocks/BlockRenderer';
import CertificateViewer from '../components/ScienceTech/CertificateViewer';

const LessonPage = () => {
  const { courseSlug, chapterSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [allCourseNav, setAllCourseNav] = useState([]); // flat list across all chapters
  const [courseNavIndex, setCourseNavIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    fetchLessonData();
  }, [courseSlug, chapterSlug, lessonSlug]);

  const fetchLessonData = async () => {
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

      // Fetch all lessons in chapter for navigation
      const { data: lessonsData } = await supabase
        .from('stem_lessons')
        .select('*')
        .eq('chapter_id', chapterData.id)
        .order('order_index');
      setAllLessons(lessonsData || []);

      // Find current lesson
      const currentLesson = lessonsData?.find(l => l.slug === lessonSlug);
      setLesson(currentLesson);
      setCurrentLessonIndex(lessonsData?.findIndex(l => l.slug === lessonSlug) || 0);

      // Fetch ALL chapters+lessons for cross-chapter navigation
      const { data: allChaptersData } = await supabase
        .from('stem_chapters')
        .select('id, slug, title, order_index, stem_lessons(id, slug, title, order_index)')
        .eq('course_id', courseData.id)
        .order('order_index');
      const flatNav = (allChaptersData || [])
        .sort((a, b) => a.order_index - b.order_index)
        .flatMap(ch => 
          (ch.stem_lessons || []).sort((a, b) => a.order_index - b.order_index).map(l => ({
            lessonSlug: l.slug,
            chapterSlug: ch.slug,
          }))
        );
      setAllCourseNav(flatNav);
      setCourseNavIndex(flatNav.findIndex(n => n.chapterSlug === chapterSlug && n.lessonSlug === lessonSlug));

      // Fetch exercises for this lesson
      if (currentLesson) {
        const { data: exercisesData } = await supabase
          .from('stem_exercises')
          .select('*')
          .eq('lesson_id', currentLesson.id)
          .order('order_index');
        setExercises(exercisesData || []);

        // Fetch user progress
        if (currentUser) {
          const { data: progressData } = await supabase
            .from('stem_lesson_progress')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('lesson_id', currentLesson.id)
            .single();
          setProgress(progressData);

          // Create progress record if doesn't exist
          if (!progressData) {
            await supabase.from('stem_lesson_progress').insert({
              user_id: currentUser.id,
              lesson_id: currentLesson.id,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeLesson = async () => {
    if (!user || !lesson || progress?.completed_at) return;

    setIsCompleting(true);
    try {
      // Update lesson progress
      await supabase
        .from('stem_lesson_progress')
        .update({ 
          completed_at: new Date().toISOString(),
          xp_earned: lesson.xp_reward || 10
        })
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id);

      // Update user XP
      await supabase.rpc('update_user_xp', { 
        p_user_id: user.id, 
        p_xp_amount: lesson.xp_reward || 10 
      });

      setProgress(prev => ({ ...prev, completed_at: new Date().toISOString() }));

      // Check if entire course is now complete
      try {
        // Get all lessons in the course
        const { data: allChapters } = await supabase
          .from('stem_chapters')
          .select('id, stem_lessons(id)')
          .eq('course_id', course.id);

        const allCourseLessonIds = (allChapters || []).flatMap(ch => 
          (ch.stem_lessons || []).map(l => l.id)
        );

        // Get completed lessons
        const { data: completedData } = await supabase
          .from('stem_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .in('lesson_id', allCourseLessonIds)
          .not('completed_at', 'is', null);

        // +1 because current lesson was just completed but query may not reflect it yet
        const completedIds = new Set((completedData || []).map(p => p.lesson_id));
        completedIds.add(lesson.id);

        if (completedIds.size >= allCourseLessonIds.length && allCourseLessonIds.length > 0) {
          // Course complete! Check if certificate already exists
          const { data: existingCert } = await supabase
            .from('stem_certificates')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .single();

          if (!existingCert) {
            // Generate certificate
            const { data: newCert } = await supabase
              .from('stem_certificates')
              .insert({ user_id: user.id, course_id: course.id })
              .select()
              .single();
            setCertificate(newCert);
          } else {
            setCertificate(existingCert);
          }
          setShowCongrats(true);
          return; // Don't auto-navigate
        }
      } catch (certError) {
        console.error('Error checking course completion:', certError);
      }

      // Navigate to next lesson if available (cross-chapter)
      if (courseNavIndex < allCourseNav.length - 1) {
        const next = allCourseNav[courseNavIndex + 1];
        navigate(`/science-tech/courses/${courseSlug}/${next.chapterSlug}/${next.lessonSlug}`);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const goToPrevLesson = () => {
    if (courseNavIndex > 0) {
      const prev = allCourseNav[courseNavIndex - 1];
      navigate(`/science-tech/courses/${courseSlug}/${prev.chapterSlug}/${prev.lessonSlug}`);
    }
  };

  const goToNextLesson = () => {
    if (courseNavIndex < allCourseNav.length - 1) {
      const next = allCourseNav[courseNavIndex + 1];
      navigate(`/science-tech/courses/${courseSlug}/${next.chapterSlug}/${next.lessonSlug}`);
    }
  };

  const isFirstLesson = courseNavIndex <= 0;
  const isLastLesson = courseNavIndex >= allCourseNav.length - 1;

  const renderVideo = () => {
    if (!lesson?.video_url) return null;

    // Check if YouTube
    const youtubeMatch = lesson.video_url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    
    if (youtubeMatch) {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }

    // Custom video (Supabase storage)
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <video
          src={lesson.video_url}
          controls
          className="w-full h-full"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#12131A]">
        <Header />
        <div className="pt-24 text-center text-gray-400">Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#12131A]">
        <Header />
        <div className="pt-24 text-center">
          <p className="text-gray-400 text-lg">Lesson not found</p>
          <Link to={`/science-tech/courses/${courseSlug}`} className="text-red-400 hover:text-red-300 mt-4 inline-block">
            ← Back to course
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = !!progress?.completed_at;

  return (
    <div className="min-h-screen bg-[#12131A]">
      <Header />
      
      {/* Top Navigation Bar */}
      <div className="fixed top-16 left-0 right-0 z-10 bg-[#12131A]/95 backdrop-blur-sm border-b border-red-900/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              to={`/science-tech/courses/${courseSlug}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{course?.title}</span>
            </Link>

            {/* Lesson Progress */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-gray-500 text-sm">{chapter?.title}</span>
                <span className="text-gray-600">•</span>
                <span className="text-white text-sm">
                  {currentLessonIndex + 1} / {allLessons.length}
                </span>
              </div>
              <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${((currentLessonIndex + (isCompleted ? 1 : 0)) / allLessons.length) * 100}%` }}
                />
              </div>
            </div>

            {/* XP Badge */}
            <div className="flex items-center gap-2 text-yellow-500">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">+{lesson.xp_reward || 10} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Block-based layout (new) */}
          {lesson.content_blocks && lesson.content_blocks.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {lesson.title}
                </h1>
                {lesson.summary && (
                  <p className="text-gray-400">{lesson.summary}</p>
                )}
              </div>
              <BlockRenderer blocks={lesson.content_blocks} />

              {/* Legacy sidebar exercises still shown at bottom for block-based lessons */}
              {exercises.length > 0 && (
                <div className="bg-black/40 rounded-xl border border-red-900/30 overflow-hidden mt-8">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="text-white font-semibold">Practice Exercises</h3>
                    <p className="text-gray-500 text-sm">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="p-4 space-y-4">
                    {exercises.map((exercise, idx) => (
                      <ExerciseWidget key={exercise.id} exercise={exercise} index={idx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Legacy 3:2 split layout */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column - Reading Content */}
              <div className="lg:col-span-3 space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {lesson.title}
                  </h1>
                  {lesson.summary && (
                    <p className="text-gray-400">{lesson.summary}</p>
                  )}
                </div>

                {/* Lesson Content (Markdown) */}
                {lesson.content && (
                  <div className="prose prose-invert prose-red max-w-none">
                    <div className="bg-black/40 rounded-xl p-6 border border-red-900/30">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                          h2: ({children}) => <h2 className="text-xl font-bold text-white mt-6 mb-3">{children}</h2>,
                          h3: ({children}) => <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>,
                          p: ({children}) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="text-gray-300">{children}</li>,
                          code: ({inline, children}) => inline 
                            ? <code className="bg-red-900/30 px-1.5 py-0.5 rounded text-red-300 text-sm">{children}</code>
                            : <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto"><code className="text-gray-300 text-sm">{children}</code></pre>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-red-500 pl-4 italic text-gray-400">{children}</blockquote>,
                          strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                          em: ({children}) => <em className="text-gray-200">{children}</em>,
                          table: ({children}) => <table className="w-full border-collapse my-4">{children}</table>,
                          thead: ({children}) => <thead className="border-b border-gray-600">{children}</thead>,
                          th: ({children}) => <th className="text-left text-white font-semibold px-3 py-2">{children}</th>,
                          td: ({children}) => <td className="text-gray-300 px-3 py-2 border-t border-gray-700/50">{children}</td>,
                        }}
                      >
                        {lesson.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Video & Exercises */}
              <div className="lg:col-span-2 space-y-6">
                {/* Video Player */}
                {lesson.video_url && (
                  <div className="bg-black/40 rounded-xl overflow-hidden border border-red-900/30">
                    <div className="p-4 border-b border-gray-800">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Play className="w-4 h-4 text-red-400" />
                        Video Lesson
                        {lesson.video_duration && (
                          <span className="text-gray-500 text-sm ml-auto">
                            {Math.floor(lesson.video_duration / 60)}:{(lesson.video_duration % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </h3>
                    </div>
                    {renderVideo()}
                  </div>
                )}

                {/* Exercises */}
                {exercises.length > 0 && (
                  <div className="bg-black/40 rounded-xl border border-red-900/30 overflow-hidden">
                    <div className="p-4 border-b border-gray-800">
                      <h3 className="text-white font-semibold">Practice Exercises</h3>
                      <p className="text-gray-500 text-sm">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="p-4 space-y-4">
                      {exercises.map((exercise, idx) => (
                        <ExerciseWidget key={exercise.id} exercise={exercise} index={idx} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#12131A]/95 backdrop-blur-sm border-t border-red-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevLesson}
              disabled={isFirstLesson}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {isCompleted ? (
              <button
                onClick={goToNextLesson}
                disabled={isLastLesson}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Completed! Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={completeLesson}
                disabled={isCompleting}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isCompleting ? 'Saving...' : 'Complete & Continue'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={goToNextLesson}
              disabled={isLastLesson}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b23] rounded-xl border border-yellow-500/30 p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Course Completed!</h2>
            <p className="text-gray-400 mb-6">
              Congratulations! You've completed all lessons in <span className="text-white font-medium">{course?.title}</span>.
            </p>
            {certificate && (
              <p className="text-yellow-500 text-sm mb-6">
                Certificate #{certificate.certificate_number} has been issued.
              </p>
            )}
            <div className="flex gap-3">
              <Link
                to={`/science-tech/courses/${courseSlug}`}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-center"
              >
                Back to Course
              </Link>
              {certificate && (
                <button
                  onClick={() => { setShowCongrats(false); setShowCertificate(true); }}
                  className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  View Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

export default LessonPage;
