import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Header from '../../components/Header';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  Plus, Edit, Trash2, X, ChevronDown, ChevronRight, 
  BookOpen, Video, FileText, HelpCircle, Eye, EyeOff,
  Layout, FileText as FileTextIcon
} from 'lucide-react';
import BlockBuilder from '../../components/Admin/BlockBuilder';

const STEMAdminPage = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showExerciseList, setShowExerciseList] = useState(null);
  const [exerciseListData, setExerciseListData] = useState([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchChapters(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: subjectsData } = await supabase
        .from('stem_subjects')
        .select('*')
        .order('order_index');
      setSubjects(subjectsData || []);

      const { data: coursesData } = await supabase
        .from('stem_courses')
        .select('*, stem_subjects(name, color)')
        .order('order_index');
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChapters = async (courseId) => {
    try {
      const { data } = await supabase
        .from('stem_chapters')
        .select(`
          *,
          stem_lessons(id, title, slug, lesson_type, order_index),
          stem_chapter_tests(id, title)
        `)
        .eq('course_id', courseId)
        .order('order_index');
      
      const sortedChapters = (data || []).map(ch => ({
        ...ch,
        stem_lessons: (ch.stem_lessons || []).sort((a, b) => a.order_index - b.order_index)
      }));
      setChapters(sortedChapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const togglePublish = async (course) => {
    try {
      await supabase
        .from('stem_courses')
        .update({ is_published: !course.is_published })
        .eq('id', course.id);
      fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course and all its content?')) return;
    try {
      await supabase.from('stem_courses').delete().eq('id', courseId);
      fetchData();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setChapters([]);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const deleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter and all its lessons?')) return;
    try {
      await supabase.from('stem_chapters').delete().eq('id', chapterId);
      fetchChapters(selectedCourse.id);
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await supabase.from('stem_lessons').delete().eq('id', lessonId);
      fetchChapters(selectedCourse.id);
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const fetchExercises = async (lessonId) => {
    try {
      const { data } = await supabase
        .from('stem_exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');
      setExerciseListData(data || []);
      setShowExerciseList(lessonId);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const deleteExercise = async (exerciseId) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      await supabase.from('stem_exercises').delete().eq('id', exerciseId);
      if (showExerciseList) fetchExercises(showExerciseList);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const fetchFullLesson = async (lessonId, chapterId) => {
    try {
      const { data } = await supabase
        .from('stem_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      if (data) {
        setEditingItem({ ...data, chapter_id: chapterId });
        setShowLessonModal(true);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    }
  };

  const lessonTypeIcons = {
    video: Video,
    reading: FileText,
    exercise: HelpCircle,
    quiz: HelpCircle,
  };

  return (
    <div className="min-h-screen bg-[#12131A]">
      <Header />
      <div className="pt-20 px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">STEM Course Management</h1>
              <p className="text-gray-400 mt-1">Create and manage courses, chapters, and lessons</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['courses', 'textbooks', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-red-600 text-white'
                    : 'bg-black/30 text-gray-400 hover:bg-black/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Courses</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowCourseModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New
                  </button>
                </div>

                {isLoading ? (
                  <div className="text-gray-400 text-center py-8">Loading...</div>
                ) : courses.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No courses yet</div>
                ) : (
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedCourse?.id === course.id
                            ? 'bg-red-900/20 border-red-500/50'
                            : 'bg-black/40 border-red-900/30 hover:border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium text-sm">{course.title}</h3>
                              {course.is_published ? (
                                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                  Live
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs mt-1">
                              {course.stem_subjects?.name} • {course.difficulty}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePublish(course);
                              }}
                              className="p-1 text-gray-400 hover:text-white"
                              title={course.is_published ? 'Unpublish' : 'Publish'}
                            >
                              {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(course);
                                setShowCourseModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCourse(course.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chapter & Lesson Editor */}
              <div className="lg:col-span-2">
                {selectedCourse ? (
                  <div className="bg-black/40 rounded-xl border border-red-900/30 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                        <p className="text-gray-500 text-sm">Manage chapters and lessons</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setShowChapterModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Chapter
                      </button>
                    </div>

                    {chapters.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No chapters yet. Add your first chapter to get started.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chapters.map((chapter, chIdx) => (
                          <div
                            key={chapter.id}
                            className="bg-black/30 rounded-lg border border-gray-800 overflow-hidden"
                          >
                            {/* Chapter Header */}
                            <div className="flex items-center gap-3 p-4">
                              <button
                                onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {expandedChapter === chapter.id ? (
                                  <ChevronDown className="w-5 h-5" />
                                ) : (
                                  <ChevronRight className="w-5 h-5" />
                                )}
                              </button>
                              <div className="flex-1">
                                <span className="text-white font-medium">
                                  {chIdx + 1}. {chapter.title}
                                </span>
                                <span className="text-gray-500 text-sm ml-2">
                                  ({chapter.stem_lessons?.length || 0} lessons)
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingItem(chapter);
                                    setShowTestModal(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-purple-400"
                                  title="Manage chapter test"
                                >
                                  <HelpCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingItem(chapter);
                                    setShowChapterModal(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-white"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteChapter(chapter.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Lessons */}
                            {expandedChapter === chapter.id && (
                              <div className="border-t border-gray-800 p-4 pt-2">
                                <div className="space-y-2">
                                  {chapter.stem_lessons?.map((lesson, lIdx) => {
                                    const Icon = lessonTypeIcons[lesson.lesson_type] || FileText;
                                    return (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center gap-3 p-2 bg-black/20 rounded-lg"
                                      >
                                        <Icon className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-300 text-sm flex-1">
                                          {lIdx + 1}. {lesson.title}
                                        </span>
                                        <span className="text-gray-600 text-xs capitalize">
                                          {lesson.lesson_type}
                                        </span>
                                        <button
                                          onClick={() => fetchExercises(lesson.id)}
                                          className="p-1 text-gray-400 hover:text-yellow-400"
                                          title="Manage exercises"
                                        >
                                          <HelpCircle className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => fetchFullLesson(lesson.id, chapter.id)}
                                          className="p-1 text-gray-400 hover:text-white"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => deleteLesson(lesson.id)}
                                          className="p-1 text-gray-400 hover:text-red-400"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Exercise list inline */}
                                {showExerciseList && chapter.stem_lessons?.some(l => l.id === showExerciseList) && (
                                  <div className="mt-3 p-3 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-yellow-400 text-sm font-medium">Exercises for: {chapter.stem_lessons.find(l => l.id === showExerciseList)?.title}</h4>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            setEditingItem({ lesson_id: showExerciseList });
                                            setShowExerciseModal(true);
                                          }}
                                          className="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1"
                                        >
                                          <Plus className="w-3.5 h-3.5" /> Add Exercise
                                        </button>
                                        <button onClick={() => setShowExerciseList(null)} className="text-gray-500 hover:text-white">
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                    {exerciseListData.length === 0 ? (
                                      <p className="text-gray-500 text-xs">No exercises yet</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {exerciseListData.map((ex, eIdx) => (
                                          <div key={ex.id} className="flex items-center gap-2 p-2 bg-black/20 rounded text-xs">
                                            <span className="text-gray-500 w-4">{eIdx + 1}.</span>
                                            <span className="text-gray-300 flex-1 truncate">{ex.question}</span>
                                            <span className="text-gray-600 capitalize">{ex.exercise_type.replace('_', ' ')}</span>
                                            <button
                                              onClick={() => {
                                                setEditingItem({ ...ex, lesson_id: showExerciseList });
                                                setShowExerciseModal(true);
                                              }}
                                              className="p-0.5 text-gray-400 hover:text-white"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => deleteExercise(ex.id)}
                                              className="p-0.5 text-gray-400 hover:text-red-400"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <button
                                  onClick={() => {
                                    setEditingItem({ chapter_id: chapter.id });
                                    setShowLessonModal(true);
                                  }}
                                  className="mt-3 flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Lesson
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-black/40 rounded-xl border border-red-900/30 p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Select a course to manage its content</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'textbooks' && (
            <TextbookManager />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <CourseModal
          course={editingItem}
          subjects={subjects}
          onClose={() => {
            setShowCourseModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowCourseModal(false);
            setEditingItem(null);
            fetchData();
          }}
        />
      )}

      {/* Chapter Modal */}
      {showChapterModal && selectedCourse && (
        <ChapterModal
          chapter={editingItem}
          courseId={selectedCourse.id}
          onClose={() => {
            setShowChapterModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowChapterModal(false);
            setEditingItem(null);
            fetchChapters(selectedCourse.id);
          }}
        />
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <LessonModal
          lesson={editingItem}
          onClose={() => {
            setShowLessonModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowLessonModal(false);
            setEditingItem(null);
            fetchChapters(selectedCourse.id);
          }}
        />
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <ExerciseModal
          exercise={editingItem}
          onClose={() => {
            setShowExerciseModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowExerciseModal(false);
            setEditingItem(null);
            if (showExerciseList) fetchExercises(showExerciseList);
          }}
        />
      )}

      {/* Test Modal */}
      {showTestModal && selectedCourse && (
        <ChapterTestModal
          chapter={editingItem}
          onClose={() => {
            setShowTestModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowTestModal(false);
            setEditingItem(null);
            fetchChapters(selectedCourse.id);
          }}
        />
      )}
    </div>
  );
};

// Course Modal Component
const CourseModal = ({ course, subjects, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    slug: course?.slug || '',
    subject_id: course?.subject_id || '',
    description: course?.description || '',
    difficulty: course?.difficulty || 'beginner',
    estimated_hours: course?.estimated_hours || '',
    what_youll_learn: course?.what_youll_learn?.join('\n') || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        what_youll_learn: formData.what_youll_learn.split('\n').filter(Boolean),
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
      };

      if (course?.id) {
        await supabase.from('stem_courses').update(data).eq('id', course.id);
      } else {
        await supabase.from('stem_courses').insert(data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1b23] rounded-xl border border-red-900/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">
            {course ? 'Edit Course' : 'New Course'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated-from-title"
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Subject</label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              required
            >
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Est. Hours</label>
              <input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">What You'll Learn (one per line)</label>
            <textarea
              value={formData.what_youll_learn}
              onChange={(e) => setFormData({ ...formData, what_youll_learn: e.target.value })}
              rows={4}
              placeholder="Learn concept A&#10;Master skill B&#10;Understand topic C"
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Chapter Modal Component
const ChapterModal = ({ chapter, courseId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: chapter?.title || '',
    slug: chapter?.slug || '',
    description: chapter?.description || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        ...formData,
        course_id: courseId,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      };

      if (chapter?.id) {
        await supabase.from('stem_chapters').update(data).eq('id', chapter.id);
      } else {
        await supabase.from('stem_chapters').insert(data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving chapter:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1b23] rounded-xl border border-red-900/30 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">
            {chapter?.id ? 'Edit Chapter' : 'New Chapter'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lesson Modal Component
const LessonModal = ({ lesson, onClose, onSave }) => {
  const hasBlocks = lesson?.content_blocks && lesson.content_blocks.length > 0;
  const [mode, setMode] = useState(hasBlocks ? 'blocks' : 'markdown');
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    slug: lesson?.slug || '',
    lesson_type: lesson?.lesson_type || 'reading',
    summary: lesson?.summary || '',
    content: lesson?.content || '',
    content_blocks: lesson?.content_blocks || [],
    video_url: lesson?.video_url || '',
    xp_reward: lesson?.xp_reward || 10,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        lesson_type: formData.lesson_type,
        summary: formData.summary,
        video_url: formData.video_url,
        xp_reward: parseInt(formData.xp_reward),
      };

      if (mode === 'blocks') {
        data.content_blocks = formData.content_blocks;
        data.content = null; // clear legacy content when using blocks
      } else {
        data.content = formData.content;
        data.content_blocks = null; // clear blocks when using legacy
      }

      if (lesson?.id) {
        await supabase.from('stem_lessons').update(data).eq('id', lesson.id);
      } else {
        await supabase.from('stem_lessons').insert({ ...data, chapter_id: lesson.chapter_id });
      }
      onSave();
    } catch (error) {
      console.error('Error saving lesson:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1b23] rounded-xl border border-red-900/30 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">
            {lesson?.id ? 'Edit Lesson' : 'New Lesson'}
          </h3>
          <div className="flex items-center gap-3">
            {/* Mode toggle */}
            <div className="flex items-center bg-black/40 rounded-lg border border-gray-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setMode('markdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  mode === 'markdown' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileTextIcon className="w-3.5 h-3.5" />
                Markdown
              </button>
              <button
                type="button"
                onClick={() => setMode('blocks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  mode === 'blocks' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                Block Builder
              </button>
            </div>
            {mode === 'markdown' && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  showPreview ? 'bg-red-600 text-white' : 'bg-black/30 text-gray-400 hover:text-white'
                }`}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select
                value={formData.lesson_type}
                onChange={(e) => setFormData({ ...formData, lesson_type: e.target.value })}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              >
                <option value="reading">Reading</option>
                <option value="video">Video</option>
                <option value="exercise">Exercise</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Summary</label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Video URL (YouTube or direct)</label>
            <input
              type="text"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=... or direct URL"
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Content area - Markdown mode */}
          {mode === 'markdown' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Content (Markdown)</label>
              <div className={showPreview ? 'grid grid-cols-2 gap-4' : ''}>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={16}
                  placeholder="## Lesson Title&#10;&#10;Your lesson content in Markdown..."
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none font-mono text-sm"
                />
                {showPreview && (
                  <div className="bg-black/40 rounded-lg p-4 border border-gray-700 overflow-y-auto max-h-[400px]">
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
                        table: ({children}) => <table className="w-full border-collapse mb-4">{children}</table>,
                        th: ({children}) => <th className="border border-gray-700 px-3 py-2 text-white bg-black/30 text-left text-sm">{children}</th>,
                        td: ({children}) => <td className="border border-gray-700 px-3 py-2 text-gray-300 text-sm">{children}</td>,
                      }}
                    >
                      {formData.content || '*Start typing to see preview...*'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content area - Block Builder mode */}
          {mode === 'blocks' && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Content Blocks</label>
              <BlockBuilder
                blocks={formData.content_blocks || []}
                onChange={(newBlocks) => setFormData({ ...formData, content_blocks: newBlocks })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">XP Reward</label>
            <input
              type="number"
              value={formData.xp_reward}
              onChange={(e) => setFormData({ ...formData, xp_reward: e.target.value })}
              className="w-24 px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Exercise Modal Component
const ExerciseModal = ({ exercise, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    exercise_type: exercise?.exercise_type || 'multiple_choice',
    question: exercise?.question || '',
    options: exercise?.options ? exercise.options.join('\n') : '',
    correct_answer: exercise?.correct_answer || '',
    hint: exercise?.hint || '',
    explanation: exercise?.explanation || '',
    order_index: exercise?.order_index || 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        lesson_id: exercise.lesson_id,
        exercise_type: formData.exercise_type,
        question: formData.question,
        options: formData.exercise_type === 'multiple_choice'
          ? formData.options.split('\n').filter(Boolean)
          : null,
        correct_answer: formData.correct_answer,
        hint: formData.hint || null,
        explanation: formData.explanation || null,
        order_index: parseInt(formData.order_index) || 0,
      };

      if (exercise?.id) {
        await supabase.from('stem_exercises').update(data).eq('id', exercise.id);
      } else {
        await supabase.from('stem_exercises').insert(data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving exercise:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1b23] rounded-xl border border-red-900/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">
            {exercise?.id ? 'Edit Exercise' : 'New Exercise'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select
                value={formData.exercise_type}
                onChange={(e) => setFormData({ ...formData, exercise_type: e.target.value })}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="numeric">Numeric</option>
                <option value="fill_blank">Fill in the Blank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Order</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Question</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none"
              required
            />
          </div>
          {formData.exercise_type === 'multiple_choice' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Options (one per line)</label>
              <textarea
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                rows={4}
                placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Correct Answer {formData.exercise_type === 'multiple_choice' && '(must match one option exactly)'}
            </label>
            <input
              type="text"
              value={formData.correct_answer}
              onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Hint (optional)</label>
            <input
              type="text"
              value={formData.hint}
              onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Explanation (shown after answer)</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Chapter Test Modal Component
const ChapterTestModal = ({ chapter, onClose, onSave }) => {
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    setIsLoading(true);
    try {
      const { data: testData } = await supabase
        .from('stem_chapter_tests')
        .select('*')
        .eq('chapter_id', chapter.id)
        .single();

      if (testData) {
        setTest(testData);
        const { data: questionsData } = await supabase
          .from('stem_test_questions')
          .select('*')
          .eq('test_id', testData.id)
          .order('order_index');
        setQuestions(questionsData || []);
      }
    } catch (error) {
      // No test exists yet — that's OK
    } finally {
      setIsLoading(false);
    }
  };

  const createTest = async () => {
    setIsSaving(true);
    try {
      const { data } = await supabase
        .from('stem_chapter_tests')
        .insert({ chapter_id: chapter.id, title: `${chapter.title} Test`, passing_score: 70 })
        .select()
        .single();
      setTest(data);
    } catch (error) {
      console.error('Error creating test:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveQuestion = async (questionData) => {
    setIsSaving(true);
    try {
      const data = {
        test_id: test.id,
        question: questionData.question,
        question_type: questionData.question_type,
        options: questionData.question_type === 'multiple_choice'
          ? questionData.options.split('\n').filter(Boolean)
          : null,
        correct_answer: questionData.correct_answer,
        explanation: questionData.explanation || null,
        points: parseInt(questionData.points) || 1,
        order_index: parseInt(questionData.order_index) || 0,
      };

      if (questionData.id) {
        await supabase.from('stem_test_questions').update(data).eq('id', questionData.id);
      } else {
        await supabase.from('stem_test_questions').insert(data);
      }
      setShowQuestionForm(false);
      setEditingQuestion(null);
      fetchTestData();
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await supabase.from('stem_test_questions').delete().eq('id', questionId);
      fetchTestData();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1b23] rounded-xl border border-red-900/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Chapter Test: {chapter.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="text-gray-400 text-center py-8">Loading...</div>
          ) : !test ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No test exists for this chapter yet.</p>
              <button
                onClick={createTest}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {isSaving ? 'Creating...' : 'Create Chapter Test'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Passing score: {test.passing_score}%</p>
                  <p className="text-gray-500 text-xs">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowQuestionForm(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div key={q.id} className="p-3 bg-black/30 rounded-lg border border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">{qIdx + 1}. ({q.question_type.replace('_', ' ')}) — {q.points} pt{q.points !== 1 ? 's' : ''}</span>
                      <p className="text-white text-sm mt-1">{q.question}</p>
                      <p className="text-green-400 text-xs mt-1">Answer: {q.correct_answer}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingQuestion({
                            ...q,
                            options: q.options ? q.options.join('\n') : '',
                          });
                          setShowQuestionForm(true);
                        }}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {showQuestionForm && (
                <TestQuestionForm
                  question={editingQuestion}
                  onSave={saveQuestion}
                  onCancel={() => {
                    setShowQuestionForm(false);
                    setEditingQuestion(null);
                  }}
                  isSaving={isSaving}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Test Question Inline Form
const TestQuestionForm = ({ question, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    id: question?.id || null,
    question_type: question?.question_type || 'multiple_choice',
    question: question?.question || '',
    options: question?.options || '',
    correct_answer: question?.correct_answer || '',
    explanation: question?.explanation || '',
    points: question?.points || 1,
    order_index: question?.order_index || 0,
  });

  return (
    <div className="p-4 bg-purple-900/10 border border-purple-900/30 rounded-lg space-y-3">
      <h4 className="text-purple-400 text-sm font-medium">{question?.id ? 'Edit Question' : 'New Question'}</h4>
      <div className="grid grid-cols-3 gap-3">
        <select
          value={formData.question_type}
          onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
          className="px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True/False</option>
          <option value="numeric">Numeric</option>
        </select>
        <input
          type="number"
          value={formData.points}
          onChange={(e) => setFormData({ ...formData, points: e.target.value })}
          placeholder="Points"
          className="px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
        />
        <input
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
          placeholder="Order"
          className="px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
        />
      </div>
      <textarea
        value={formData.question}
        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
        rows={2}
        placeholder="Question text..."
        className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none resize-none"
        required
      />
      {formData.question_type === 'multiple_choice' && (
        <textarea
          value={formData.options}
          onChange={(e) => setFormData({ ...formData, options: e.target.value })}
          rows={3}
          placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
          className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none resize-none"
        />
      )}
      <input
        type="text"
        value={formData.correct_answer}
        onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
        placeholder="Correct answer"
        className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
        required
      />
      <input
        type="text"
        value={formData.explanation}
        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
        placeholder="Explanation (optional)"
        className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-gray-400 hover:text-white text-sm">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(formData)}
          disabled={isSaving || !formData.question || !formData.correct_answer}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </div>
  );
};

// Textbook Manager Component
const TextbookManager = () => {
  const [textbooks, setTextbooks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [{ data: textbooksData }, { data: subjectsData }] = await Promise.all([
        supabase.from('stem_textbooks').select('*, stem_subjects(name)').order('created_at', { ascending: false }),
        supabase.from('stem_subjects').select('*').order('order_index'),
      ]);
      setTextbooks(textbooksData || []);
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error('Error fetching textbooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTextbook = async (id) => {
    if (!window.confirm('Delete this textbook?')) return;
    try {
      await supabase.from('stem_textbooks').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error deleting textbook:', error);
    }
  };

  const togglePublish = async (textbook) => {
    try {
      await supabase
        .from('stem_textbooks')
        .update({ is_published: !textbook.is_published })
        .eq('id', textbook.id);
      fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Textbooks</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Upload Textbook
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : textbooks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No textbooks uploaded yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {textbooks.map((book) => (
            <div
              key={book.id}
              className="bg-black/40 rounded-lg border border-red-900/30 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-medium">{book.title}</h3>
                  <p className="text-gray-500 text-sm">{book.author}</p>
                  <p className="text-gray-600 text-xs mt-1">{book.stem_subjects?.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePublish(book)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {book.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(book);
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTextbook(book.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TextbookModal
          textbook={editingItem}
          subjects={subjects}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingItem(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// Textbook Modal
const TextbookModal = ({ textbook, subjects, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: textbook?.title || '',
    author: textbook?.author || '',
    subject_id: textbook?.subject_id || '',
    description: textbook?.description || '',
    file_url: textbook?.file_url || '',
    cover_url: textbook?.cover_url || '',
    page_count: textbook?.page_count || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        ...formData,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
      };

      if (textbook?.id) {
        await supabase.from('stem_textbooks').update(data).eq('id', textbook.id);
      } else {
        await supabase.from('stem_textbooks').insert(data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving textbook:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1b23] rounded-xl border border-red-900/30 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">
            {textbook ? 'Edit Textbook' : 'Upload Textbook'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Subject</label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">PDF URL (Supabase Storage)</label>
            <input
              type="text"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cover Image URL</label>
            <input
              type="text"
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Page Count</label>
            <input
              type="number"
              value={formData.page_count}
              onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
              className="w-24 px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courseStats, setCourseStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Total enrollments
      const { count: enrollmentCount } = await supabase
        .from('stem_enrollments')
        .select('*', { count: 'exact', head: true });

      // Total certificates
      const { count: certCount } = await supabase
        .from('stem_certificates')
        .select('*', { count: 'exact', head: true });

      // Total test attempts
      const { count: attemptCount } = await supabase
        .from('stem_test_attempts')
        .select('*', { count: 'exact', head: true });

      // Passed test attempts
      const { count: passedCount } = await supabase
        .from('stem_test_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('passed', true);

      // Total completed lessons
      const { count: completedLessons } = await supabase
        .from('stem_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .not('completed_at', 'is', null);

      setStats({
        enrollments: enrollmentCount || 0,
        certificates: certCount || 0,
        testAttempts: attemptCount || 0,
        testsPassed: passedCount || 0,
        passRate: attemptCount > 0 ? Math.round((passedCount / attemptCount) * 100) : 0,
        completedLessons: completedLessons || 0,
      });

      // Per-course stats
      const { data: courses } = await supabase
        .from('stem_courses')
        .select('id, title, slug, is_published, stem_subjects(name, color)')
        .order('order_index');

      if (courses) {
        const courseIds = courses.map(c => c.id);

        // Enrollments per course
        const { data: enrollments } = await supabase
          .from('stem_enrollments')
          .select('course_id')
          .in('course_id', courseIds);

        const enrollMap = {};
        (enrollments || []).forEach(e => {
          enrollMap[e.course_id] = (enrollMap[e.course_id] || 0) + 1;
        });

        // Certificates per course
        const { data: certs } = await supabase
          .from('stem_certificates')
          .select('course_id')
          .in('course_id', courseIds);

        const certMap = {};
        (certs || []).forEach(c => {
          certMap[c.course_id] = (certMap[c.course_id] || 0) + 1;
        });

        setCourseStats(courses.map(c => ({
          ...c,
          enrollments: enrollMap[c.id] || 0,
          certificates: certMap[c.id] || 0,
          completionRate: enrollMap[c.id] > 0
            ? Math.round(((certMap[c.id] || 0) / enrollMap[c.id]) * 100)
            : 0,
        })));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-400 text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Enrollments', value: stats?.enrollments, color: 'text-blue-400', border: 'border-blue-900/30' },
          { label: 'Lessons Done', value: stats?.completedLessons, color: 'text-green-400', border: 'border-green-900/30' },
          { label: 'Certificates', value: stats?.certificates, color: 'text-yellow-400', border: 'border-yellow-900/30' },
          { label: 'Test Attempts', value: stats?.testAttempts, color: 'text-purple-400', border: 'border-purple-900/30' },
          { label: 'Tests Passed', value: stats?.testsPassed, color: 'text-emerald-400', border: 'border-emerald-900/30' },
          { label: 'Pass Rate', value: `${stats?.passRate}%`, color: 'text-orange-400', border: 'border-orange-900/30' },
        ].map((card, idx) => (
          <div key={idx} className={`bg-black/40 rounded-lg p-4 border ${card.border}`}>
            <p className="text-gray-500 text-xs mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Per-Course Table */}
      <div className="bg-black/40 rounded-xl border border-red-900/30 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Course Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-gray-400 text-xs font-medium">Course</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium">Subject</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium text-right">Enrollments</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium text-right">Certificates</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium text-right">Completion %</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {courseStats.map((course) => (
                <tr key={course.id} className="border-b border-gray-800/50 hover:bg-black/20">
                  <td className="px-4 py-3 text-white text-sm font-medium">{course.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: (course.stem_subjects?.color || '#666') + '80' }}
                    >
                      {course.stem_subjects?.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-blue-400 text-sm text-right font-medium">{course.enrollments}</td>
                  <td className="px-4 py-3 text-yellow-400 text-sm text-right font-medium">{course.certificates}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                      <span className="text-green-400 text-xs w-8 text-right">{course.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {course.is_published ? (
                      <span className="text-green-400 text-xs bg-green-900/30 px-2 py-0.5 rounded">Live</span>
                    ) : (
                      <span className="text-gray-500 text-xs bg-gray-800 px-2 py-0.5 rounded">Draft</span>
                    )}
                  </td>
                </tr>
              ))}
              {courseStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No courses yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default STEMAdminPage;
