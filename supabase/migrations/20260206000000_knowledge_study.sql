-- ============================================
-- KNOWLEDGE STUDY SYSTEM
-- Gamified theory learning with cells, quizzes, and progression
-- ============================================

-- =============================================
-- STUDY CELLS (Groups of 5)
-- =============================================
CREATE TABLE IF NOT EXISTS knowledge_cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    weekly_xp INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_cell_members (
    cell_id UUID REFERENCES knowledge_cells(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (cell_id, user_id)
);

-- =============================================
-- QUIZZES & QUESTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS knowledge_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    topic_id UUID REFERENCES knowledge_topics(id) ON DELETE SET NULL,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('daily', 'weekly', 'standard', 'survival')),
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    xp_reward INTEGER DEFAULT 25,
    time_limit_seconds INTEGER DEFAULT 60,
    day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES knowledge_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN (
        'multiple_choice', 'true_false', 'scenario', 'swipe', 'fill_blank'
    )),
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- USER PROGRESS
-- =============================================
CREATE TABLE IF NOT EXISTS knowledge_user_progress (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_rank TEXT DEFAULT 'noob' CHECK (current_rank IN (
        'noob', 'activist', 'organizer', 'cadre', 'revolutionary', 'vanguard'
    )),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    daily_xp_earned INTEGER DEFAULT 0,
    daily_xp_reset_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- QUIZ ATTEMPTS
-- =============================================
CREATE TABLE IF NOT EXISTS knowledge_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES knowledge_quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    answers JSONB,
    completed_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON knowledge_quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON knowledge_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON knowledge_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_day ON knowledge_quizzes(day_of_week);
CREATE INDEX IF NOT EXISTS idx_cell_members_user ON knowledge_cell_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cells_weekly_xp ON knowledge_cells(weekly_xp DESC);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Calculate rank from XP
CREATE OR REPLACE FUNCTION calculate_rank(xp INTEGER) RETURNS TEXT AS $$
BEGIN
    IF xp >= 12000 THEN RETURN 'vanguard';
    ELSIF xp >= 7000 THEN RETURN 'revolutionary';
    ELSIF xp >= 3500 THEN RETURN 'cadre';
    ELSIF xp >= 1500 THEN RETURN 'organizer';
    ELSIF xp >= 500 THEN RETURN 'activist';
    ELSE RETURN 'noob';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get streak multiplier
CREATE OR REPLACE FUNCTION get_streak_multiplier(streak INTEGER) RETURNS NUMERIC AS $$
BEGIN
    IF streak >= 100 THEN RETURN 1.5;
    ELSIF streak >= 30 THEN RETURN 1.3;
    ELSIF streak >= 7 THEN RETURN 1.2;
    ELSE RETURN 1.0;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: Update progress after quiz attempt
CREATE OR REPLACE FUNCTION update_progress_after_quiz() RETURNS TRIGGER AS $$
DECLARE
    v_daily_cap INTEGER := 100;
    v_current_daily_xp INTEGER;
    v_streak INTEGER;
    v_last_activity DATE;
    v_multiplier NUMERIC;
    v_actual_xp INTEGER;
BEGIN
    -- Upsert user progress
    INSERT INTO knowledge_user_progress (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Get current state
    SELECT daily_xp_earned, current_streak, last_activity_date
    INTO v_current_daily_xp, v_streak, v_last_activity
    FROM knowledge_user_progress WHERE user_id = NEW.user_id;
    
    -- Handle nulls
    v_current_daily_xp := COALESCE(v_current_daily_xp, 0);
    v_streak := COALESCE(v_streak, 0);
    
    -- Reset daily XP if new day
    IF v_last_activity IS NULL OR v_last_activity < CURRENT_DATE THEN
        v_current_daily_xp := 0;
    END IF;
    
    -- Update streak
    IF v_last_activity IS NULL OR v_last_activity < CURRENT_DATE - 1 THEN
        v_streak := 1;
    ELSIF v_last_activity = CURRENT_DATE - 1 THEN
        v_streak := v_streak + 1;
    END IF;
    -- If same day, streak stays the same
    
    -- Calculate actual XP (capped + multiplied)
    v_multiplier := get_streak_multiplier(v_streak);
    v_actual_xp := LEAST(NEW.xp_earned, v_daily_cap - v_current_daily_xp);
    v_actual_xp := GREATEST(v_actual_xp, 0);
    v_actual_xp := FLOOR(v_actual_xp * v_multiplier);
    
    -- Update the attempt record with actual XP earned
    NEW.xp_earned := v_actual_xp;
    
    -- Update user progress
    UPDATE knowledge_user_progress SET
        total_xp = total_xp + v_actual_xp,
        daily_xp_earned = CASE WHEN last_activity_date IS NULL OR last_activity_date < CURRENT_DATE 
                          THEN v_actual_xp ELSE daily_xp_earned + v_actual_xp END,
        daily_xp_reset_at = CURRENT_DATE,
        current_streak = v_streak,
        longest_streak = GREATEST(COALESCE(longest_streak, 0), v_streak),
        last_activity_date = CURRENT_DATE,
        current_rank = calculate_rank(total_xp + v_actual_xp),
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Update cell weekly XP
    UPDATE knowledge_cells c SET weekly_xp = weekly_xp + v_actual_xp
    FROM knowledge_cell_members cm
    WHERE cm.cell_id = c.id AND cm.user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_progress ON knowledge_quiz_attempts;
CREATE TRIGGER trigger_update_progress
    BEFORE INSERT ON knowledge_quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION update_progress_after_quiz();

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE knowledge_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_cell_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Cells: public read, auth create/join
DROP POLICY IF EXISTS "Anyone can view cells" ON knowledge_cells;
CREATE POLICY "Anyone can view cells" ON knowledge_cells FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can create cells" ON knowledge_cells;
CREATE POLICY "Auth users can create cells" ON knowledge_cells FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Creators can update cells" ON knowledge_cells;
CREATE POLICY "Creators can update cells" ON knowledge_cells FOR UPDATE USING (auth.uid() = created_by);

-- Cell members
DROP POLICY IF EXISTS "Anyone can view members" ON knowledge_cell_members;
CREATE POLICY "Anyone can view members" ON knowledge_cell_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join cells" ON knowledge_cell_members;
CREATE POLICY "Users can join cells" ON knowledge_cell_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave cells" ON knowledge_cell_members;
CREATE POLICY "Users can leave cells" ON knowledge_cell_members FOR DELETE USING (auth.uid() = user_id);

-- Quizzes: public read
DROP POLICY IF EXISTS "Anyone can view quizzes" ON knowledge_quizzes;
CREATE POLICY "Anyone can view quizzes" ON knowledge_quizzes FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view questions" ON knowledge_quiz_questions;
CREATE POLICY "Anyone can view questions" ON knowledge_quiz_questions FOR SELECT USING (true);

-- Progress: own data only
DROP POLICY IF EXISTS "Users view own progress" ON knowledge_user_progress;
CREATE POLICY "Users view own progress" ON knowledge_user_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own progress" ON knowledge_user_progress;
CREATE POLICY "Users insert own progress" ON knowledge_user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own progress" ON knowledge_user_progress;
CREATE POLICY "Users update own progress" ON knowledge_user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Attempts: own data only
DROP POLICY IF EXISTS "Users view own attempts" ON knowledge_quiz_attempts;
CREATE POLICY "Users view own attempts" ON knowledge_quiz_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create attempts" ON knowledge_quiz_attempts;
CREATE POLICY "Users create attempts" ON knowledge_quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- ADMIN POLICIES FOR QUIZ MANAGEMENT
-- =============================================

-- Admin can manage quizzes
DROP POLICY IF EXISTS "Admins can insert quizzes" ON knowledge_quizzes;
CREATE POLICY "Admins can insert quizzes" ON knowledge_quizzes FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update quizzes" ON knowledge_quizzes;
CREATE POLICY "Admins can update quizzes" ON knowledge_quizzes FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete quizzes" ON knowledge_quizzes;
CREATE POLICY "Admins can delete quizzes" ON knowledge_quizzes FOR DELETE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin can manage questions
DROP POLICY IF EXISTS "Admins can insert questions" ON knowledge_quiz_questions;
CREATE POLICY "Admins can insert questions" ON knowledge_quiz_questions FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update questions" ON knowledge_quiz_questions;
CREATE POLICY "Admins can update questions" ON knowledge_quiz_questions FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete questions" ON knowledge_quiz_questions;
CREATE POLICY "Admins can delete questions" ON knowledge_quiz_questions FOR DELETE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin can view all quizzes (including inactive)
DROP POLICY IF EXISTS "Admins can view all quizzes" ON knowledge_quizzes;
CREATE POLICY "Admins can view all quizzes" ON knowledge_quizzes FOR SELECT 
    USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- No seed data - all quizzes are managed via the admin dashboard
