-- STEM Learning Platform Migration
-- Creates tables for course-based learning system (DataCamp/Brilliant/edX style)

-- ============================================
-- SUBJECTS (Physics, Chemistry, Math, CS, Medicine)
-- ============================================
CREATE TABLE stem_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  color TEXT DEFAULT '#ef4444',
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- COURSES within subjects
-- ============================================
CREATE TABLE stem_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES stem_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  what_youll_learn JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours INT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CHAPTERS within courses
-- ============================================
CREATE TABLE stem_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES stem_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, slug)
);

-- ============================================
-- LESSONS within chapters
-- ============================================
CREATE TABLE stem_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES stem_chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  lesson_type TEXT CHECK (lesson_type IN ('video', 'reading', 'exercise', 'quiz')) DEFAULT 'reading',
  content TEXT,
  summary TEXT,
  video_url TEXT,
  video_duration INT,
  presentation_url TEXT,
  xp_reward INT DEFAULT 10,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chapter_id, slug)
);

-- ============================================
-- EXERCISES within lessons
-- ============================================
CREATE TABLE stem_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES stem_lessons(id) ON DELETE CASCADE,
  exercise_type TEXT CHECK (exercise_type IN ('multiple_choice', 'fill_blank', 'numeric', 'code')) DEFAULT 'multiple_choice',
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  hint TEXT,
  explanation TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CHAPTER TESTS (end of chapter assessments)
-- ============================================
CREATE TABLE stem_chapter_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES stem_chapters(id) ON DELETE CASCADE UNIQUE,
  title TEXT DEFAULT 'Chapter Test',
  passing_score INT DEFAULT 70,
  time_limit_minutes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TEST QUESTIONS
-- ============================================
CREATE TABLE stem_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES stem_chapter_tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'numeric')) DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INT DEFAULT 1,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TEXTBOOKS (uploaded PDFs)
-- ============================================
CREATE TABLE stem_textbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES stem_subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  file_url TEXT NOT NULL,
  cover_url TEXT,
  page_count INT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USER ENROLLMENTS
-- ============================================
CREATE TABLE stem_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES stem_courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- ============================================
-- USER LESSON PROGRESS
-- ============================================
CREATE TABLE stem_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES stem_lessons(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  xp_earned INT DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- USER TEST ATTEMPTS
-- ============================================
CREATE TABLE stem_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES stem_chapter_tests(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total_points INT NOT NULL,
  passed BOOLEAN,
  answers JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USER XP TRACKING
-- ============================================
CREATE TABLE stem_user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CERTIFICATES
-- ============================================
CREATE TABLE stem_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES stem_courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  final_score INT,
  UNIQUE(user_id, course_id)
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_stem_courses_subject ON stem_courses(subject_id);
CREATE INDEX idx_stem_chapters_course ON stem_chapters(course_id);
CREATE INDEX idx_stem_lessons_chapter ON stem_lessons(chapter_id);
CREATE INDEX idx_stem_exercises_lesson ON stem_exercises(lesson_id);
CREATE INDEX idx_stem_test_questions_test ON stem_test_questions(test_id);
CREATE INDEX idx_stem_enrollments_user ON stem_enrollments(user_id);
CREATE INDEX idx_stem_enrollments_course ON stem_enrollments(course_id);
CREATE INDEX idx_stem_lesson_progress_user ON stem_lesson_progress(user_id);
CREATE INDEX idx_stem_lesson_progress_lesson ON stem_lesson_progress(lesson_id);
CREATE INDEX idx_stem_test_attempts_user ON stem_test_attempts(user_id);
CREATE INDEX idx_stem_certificates_user ON stem_certificates(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE stem_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_chapter_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_certificates ENABLE ROW LEVEL SECURITY;

-- Public read access for content tables (subjects, courses, chapters, lessons, etc.)
CREATE POLICY "Public read access for subjects" ON stem_subjects FOR SELECT USING (true);
CREATE POLICY "Public read access for published courses" ON stem_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access for chapters" ON stem_chapters FOR SELECT 
  USING (EXISTS (SELECT 1 FROM stem_courses WHERE stem_courses.id = stem_chapters.course_id AND is_published = true));
CREATE POLICY "Public read access for lessons" ON stem_lessons FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM stem_chapters 
    JOIN stem_courses ON stem_courses.id = stem_chapters.course_id 
    WHERE stem_chapters.id = stem_lessons.chapter_id AND stem_courses.is_published = true
  ));
CREATE POLICY "Public read access for exercises" ON stem_exercises FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM stem_lessons
    JOIN stem_chapters ON stem_chapters.id = stem_lessons.chapter_id
    JOIN stem_courses ON stem_courses.id = stem_chapters.course_id
    WHERE stem_lessons.id = stem_exercises.lesson_id AND stem_courses.is_published = true
  ));
CREATE POLICY "Public read access for chapter tests" ON stem_chapter_tests FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM stem_chapters
    JOIN stem_courses ON stem_courses.id = stem_chapters.course_id
    WHERE stem_chapters.id = stem_chapter_tests.chapter_id AND stem_courses.is_published = true
  ));
CREATE POLICY "Public read access for test questions" ON stem_test_questions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM stem_chapter_tests
    JOIN stem_chapters ON stem_chapters.id = stem_chapter_tests.chapter_id
    JOIN stem_courses ON stem_courses.id = stem_chapters.course_id
    WHERE stem_chapter_tests.id = stem_test_questions.test_id AND stem_courses.is_published = true
  ));
CREATE POLICY "Public read access for published textbooks" ON stem_textbooks FOR SELECT USING (is_published = true);

-- User-specific policies for progress tables
CREATE POLICY "Users can view own enrollments" ON stem_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON stem_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON stem_enrollments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lesson progress" ON stem_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON stem_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON stem_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own test attempts" ON stem_test_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test attempts" ON stem_test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own XP" ON stem_user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own XP" ON stem_user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own XP" ON stem_user_xp FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own certificates" ON stem_certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can verify certificates" ON stem_certificates FOR SELECT USING (true);

-- Admin policies (check if user is admin via profiles table)
CREATE POLICY "Admins can manage subjects" ON stem_subjects FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage all courses" ON stem_courses FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage chapters" ON stem_chapters FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage lessons" ON stem_lessons FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage exercises" ON stem_exercises FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage chapter tests" ON stem_chapter_tests FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage test questions" ON stem_test_questions FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can manage textbooks" ON stem_textbooks FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can issue certificates" ON stem_certificates FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============================================
-- SEED DATA: Initial Subjects
-- ============================================
INSERT INTO stem_subjects (name, slug, description, icon_name, color, order_index) VALUES
  ('Physics', 'physics', 'Understanding the fundamental laws governing the physical world', 'Atom', '#3b82f6', 1),
  ('Chemistry', 'chemistry', 'Exploring matter, its properties, and transformations', 'FlaskConical', '#22c55e', 2),
  ('Mathematics', 'mathematics', 'The language of logic and quantitative reasoning', 'Calculator', '#a855f7', 3),
  ('Computer Science', 'computer-science', 'Theory and practice of computation and programming', 'Code', '#f59e0b', 4),
  ('Medicine & Biology', 'medicine-biology', 'Understanding life, health, and the human body', 'Heart', '#ef4444', 5);

-- ============================================
-- HELPER FUNCTION: Generate certificate number
-- ============================================
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'CERT-';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-generate certificate number
-- ============================================
CREATE OR REPLACE FUNCTION set_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := generate_certificate_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_certificate_number
  BEFORE INSERT ON stem_certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_certificate_number();

-- ============================================
-- FUNCTION: Update user XP
-- ============================================
CREATE OR REPLACE FUNCTION update_user_xp(p_user_id UUID, p_xp_amount INT)
RETURNS void AS $$
BEGIN
  INSERT INTO stem_user_xp (user_id, total_xp, current_streak, last_activity_date)
  VALUES (p_user_id, p_xp_amount, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = stem_user_xp.total_xp + p_xp_amount,
    current_streak = CASE 
      WHEN stem_user_xp.last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
        THEN stem_user_xp.current_streak + 1
      WHEN stem_user_xp.last_activity_date = CURRENT_DATE 
        THEN stem_user_xp.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      stem_user_xp.longest_streak,
      CASE 
        WHEN stem_user_xp.last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
          THEN stem_user_xp.current_streak + 1
        WHEN stem_user_xp.last_activity_date = CURRENT_DATE 
          THEN stem_user_xp.current_streak
        ELSE 1
      END
    ),
    last_activity_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
