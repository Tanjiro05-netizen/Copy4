-- =============================================
-- HISTORICAL SCENARIOS & CONCEPT MASTERY TREE
-- Advanced gamification for theory learning
-- =============================================

-- =============================================
-- HISTORICAL SCENARIOS (Choose Your Own Adventure)
-- =============================================

CREATE TABLE IF NOT EXISTS knowledge_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    setting TEXT, -- Historical context (e.g., "1892 Homestead Strike")
    era TEXT, -- Time period
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    xp_reward INTEGER DEFAULT 50,
    estimated_minutes INTEGER DEFAULT 10,
    cover_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scenario nodes (each decision point in the story)
CREATE TABLE IF NOT EXISTS knowledge_scenario_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES knowledge_scenarios(id) ON DELETE CASCADE,
    node_type TEXT NOT NULL CHECK (node_type IN ('start', 'story', 'choice', 'ending')),
    title TEXT, -- Optional title for the node
    content TEXT NOT NULL, -- The narrative text
    image_url TEXT, -- Optional illustration
    is_start BOOLEAN DEFAULT false, -- Entry point of scenario
    ending_type TEXT CHECK (ending_type IN ('victory', 'partial', 'defeat', NULL)), -- For ending nodes
    ending_insight TEXT, -- Historical lesson learned
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Choices within nodes
CREATE TABLE IF NOT EXISTS knowledge_scenario_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES knowledge_scenario_nodes(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL, -- What the player sees
    next_node_id UUID REFERENCES knowledge_scenario_nodes(id) ON DELETE SET NULL,
    consequence_preview TEXT, -- Optional hint about outcome
    is_historically_accurate BOOLEAN DEFAULT false, -- Bonus for choosing historical path
    concept_demonstrated TEXT, -- Which concept this choice demonstrates
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Track user progress through scenarios
CREATE TABLE IF NOT EXISTS knowledge_scenario_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES knowledge_scenarios(id) ON DELETE CASCADE,
    current_node_id UUID REFERENCES knowledge_scenario_nodes(id) ON DELETE SET NULL,
    choices_made JSONB DEFAULT '[]', -- Array of choice IDs made
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    ending_reached TEXT, -- victory/partial/defeat
    xp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, scenario_id)
);

-- =============================================
-- CONCEPT MASTERY TREE
-- =============================================

-- Concept categories (branches of the tree)
CREATE TABLE IF NOT EXISTS knowledge_concept_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Emoji or icon name
    color TEXT DEFAULT 'red', -- For UI theming
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual concepts (nodes in the tree)
CREATE TABLE IF NOT EXISTS knowledge_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES knowledge_concept_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    detailed_explanation TEXT, -- Full lesson content
    key_theorists TEXT[], -- Array of theorist names
    key_works TEXT[], -- Array of work titles
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5), -- 1=basic, 5=advanced
    xp_value INTEGER DEFAULT 25,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Concept prerequisites (edges in the tree)
CREATE TABLE IF NOT EXISTS knowledge_concept_prerequisites (
    concept_id UUID NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
    prerequisite_id UUID NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
    PRIMARY KEY (concept_id, prerequisite_id)
);

-- User mastery progress
CREATE TABLE IF NOT EXISTS knowledge_concept_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 3), -- 0=locked, 1=learning, 2=practiced, 3=mastered
    quiz_score INTEGER, -- Best quiz score
    application_completed BOOLEAN DEFAULT false, -- Did practical exercise
    explanation_submitted BOOLEAN DEFAULT false, -- Wrote own explanation
    xp_earned INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    mastered_at TIMESTAMPTZ,
    UNIQUE(user_id, concept_id)
);

-- Link concepts to quizzes (which quizzes teach which concepts)
CREATE TABLE IF NOT EXISTS knowledge_quiz_concepts (
    quiz_id UUID NOT NULL REFERENCES knowledge_quizzes(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
    PRIMARY KEY (quiz_id, concept_id)
);

-- Link scenarios to concepts (which scenarios teach which concepts)
CREATE TABLE IF NOT EXISTS knowledge_scenario_concepts (
    scenario_id UUID NOT NULL REFERENCES knowledge_scenarios(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
    PRIMARY KEY (scenario_id, concept_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_scenario_nodes_scenario ON knowledge_scenario_nodes(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_choices_node ON knowledge_scenario_choices(node_id);
CREATE INDEX IF NOT EXISTS idx_scenario_progress_user ON knowledge_scenario_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_concepts_category ON knowledge_concepts(category_id);
CREATE INDEX IF NOT EXISTS idx_concept_mastery_user ON knowledge_concept_mastery(user_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE knowledge_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_scenario_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_scenario_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_scenario_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_concept_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_concept_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_concept_mastery ENABLE ROW LEVEL SECURITY;

-- Scenarios: public read for active, admin write
CREATE POLICY "Anyone can view active scenarios" ON knowledge_scenarios 
    FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage scenarios" ON knowledge_scenarios 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Scenario nodes: public read, admin write
CREATE POLICY "Anyone can view scenario nodes" ON knowledge_scenario_nodes 
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage scenario nodes" ON knowledge_scenario_nodes 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Scenario choices: public read, admin write
CREATE POLICY "Anyone can view scenario choices" ON knowledge_scenario_choices 
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage scenario choices" ON knowledge_scenario_choices 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Scenario progress: user's own data
CREATE POLICY "Users can view own scenario progress" ON knowledge_scenario_progress 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scenario progress" ON knowledge_scenario_progress 
    FOR ALL USING (auth.uid() = user_id);

-- Concept categories: public read, admin write
CREATE POLICY "Anyone can view concept categories" ON knowledge_concept_categories 
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage concept categories" ON knowledge_concept_categories 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Concepts: public read, admin write
CREATE POLICY "Anyone can view concepts" ON knowledge_concepts 
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage concepts" ON knowledge_concepts 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Concept prerequisites: public read, admin write
CREATE POLICY "Anyone can view concept prerequisites" ON knowledge_concept_prerequisites 
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage concept prerequisites" ON knowledge_concept_prerequisites 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Concept mastery: user's own data
CREATE POLICY "Users can view own concept mastery" ON knowledge_concept_mastery 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own concept mastery" ON knowledge_concept_mastery 
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SEED: Concept Categories
-- =============================================

INSERT INTO knowledge_concept_categories (name, description, icon, color, order_index)
VALUES 
    ('Political Economy', 'Understanding capitalism, value, and exploitation', '💰', 'yellow', 0),
    ('Historical Materialism', 'The materialist conception of history', '📜', 'orange', 1),
    ('Dialectics', 'Dialectical thinking and analysis', '🔄', 'purple', 2),
    ('Class Analysis', 'Understanding class structure and conflict', '⚔️', 'red', 3),
    ('Revolutionary Strategy', 'Theory of organization and change', '🚩', 'rose', 4)
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED: Core Concepts (Political Economy branch)
-- =============================================

DO $$
DECLARE
    v_category_id UUID;
BEGIN
    SELECT id INTO v_category_id FROM knowledge_concept_categories WHERE name = 'Political Economy' LIMIT 1;
    
    IF v_category_id IS NOT NULL THEN
        INSERT INTO knowledge_concepts (category_id, name, description, detailed_explanation, key_theorists, key_works, difficulty, xp_value, order_index)
        VALUES 
        (v_category_id, 'Commodity', 'The basic unit of capitalist wealth', 
         'A commodity is anything produced for exchange rather than direct use. Marx begins Capital with the commodity because it is the "cell-form" of capitalist society - understanding it reveals the fundamental nature of the system.',
         ARRAY['Karl Marx'], ARRAY['Capital Vol. 1'], 1, 20, 0),
        
        (v_category_id, 'Use-Value & Exchange-Value', 'The dual nature of commodities',
         'Every commodity has two aspects: its use-value (its usefulness, what it can do) and its exchange-value (what it can be traded for). This duality reflects the contradiction at the heart of commodity production.',
         ARRAY['Karl Marx'], ARRAY['Capital Vol. 1'], 1, 20, 1),
        
        (v_category_id, 'Labor Theory of Value', 'The source of all value',
         'Value is created by human labor. Specifically, the value of a commodity is determined by the socially necessary labor time required to produce it. This is the foundation for understanding exploitation.',
         ARRAY['Karl Marx', 'David Ricardo', 'Adam Smith'], ARRAY['Capital Vol. 1', 'Principles of Political Economy'], 2, 30, 2),
        
        (v_category_id, 'Surplus Value', 'The secret of capitalist profit',
         'Surplus value is the difference between the value workers create and the value they receive as wages. It is unpaid labor appropriated by the capitalist class. This is the source of all profit, rent, and interest.',
         ARRAY['Karl Marx'], ARRAY['Capital Vol. 1'], 2, 35, 3),
        
        (v_category_id, 'Exploitation', 'The extraction of surplus value',
         'Workers are exploited because they produce more value than they receive. The rate of exploitation (surplus value / variable capital) measures the degree of this extraction.',
         ARRAY['Karl Marx'], ARRAY['Capital Vol. 1'], 2, 30, 4),
        
        (v_category_id, 'Commodity Fetishism', 'When social relations appear as things',
         'Under capitalism, relations between people take the form of relations between things (commodities). This "fetishism" obscures the social nature of production and the exploitation at its core.',
         ARRAY['Karl Marx'], ARRAY['Capital Vol. 1'], 3, 40, 5)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =============================================
-- SEED: Concept Prerequisites
-- =============================================

DO $$
DECLARE
    v_commodity_id UUID;
    v_usevalue_id UUID;
    v_ltv_id UUID;
    v_surplus_id UUID;
    v_exploitation_id UUID;
    v_fetishism_id UUID;
BEGIN
    SELECT id INTO v_commodity_id FROM knowledge_concepts WHERE name = 'Commodity' LIMIT 1;
    SELECT id INTO v_usevalue_id FROM knowledge_concepts WHERE name = 'Use-Value & Exchange-Value' LIMIT 1;
    SELECT id INTO v_ltv_id FROM knowledge_concepts WHERE name = 'Labor Theory of Value' LIMIT 1;
    SELECT id INTO v_surplus_id FROM knowledge_concepts WHERE name = 'Surplus Value' LIMIT 1;
    SELECT id INTO v_exploitation_id FROM knowledge_concepts WHERE name = 'Exploitation' LIMIT 1;
    SELECT id INTO v_fetishism_id FROM knowledge_concepts WHERE name = 'Commodity Fetishism' LIMIT 1;
    
    -- Use-Value requires Commodity
    IF v_usevalue_id IS NOT NULL AND v_commodity_id IS NOT NULL THEN
        INSERT INTO knowledge_concept_prerequisites (concept_id, prerequisite_id)
        VALUES (v_usevalue_id, v_commodity_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- LTV requires Use-Value
    IF v_ltv_id IS NOT NULL AND v_usevalue_id IS NOT NULL THEN
        INSERT INTO knowledge_concept_prerequisites (concept_id, prerequisite_id)
        VALUES (v_ltv_id, v_usevalue_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Surplus Value requires LTV
    IF v_surplus_id IS NOT NULL AND v_ltv_id IS NOT NULL THEN
        INSERT INTO knowledge_concept_prerequisites (concept_id, prerequisite_id)
        VALUES (v_surplus_id, v_ltv_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Exploitation requires Surplus Value
    IF v_exploitation_id IS NOT NULL AND v_surplus_id IS NOT NULL THEN
        INSERT INTO knowledge_concept_prerequisites (concept_id, prerequisite_id)
        VALUES (v_exploitation_id, v_surplus_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Commodity Fetishism requires Commodity and Exploitation
    IF v_fetishism_id IS NOT NULL AND v_commodity_id IS NOT NULL THEN
        INSERT INTO knowledge_concept_prerequisites (concept_id, prerequisite_id)
        VALUES (v_fetishism_id, v_commodity_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF v_fetishism_id IS NOT NULL AND v_exploitation_id IS NOT NULL THEN
        INSERT INTO knowledge_concept_prerequisites (concept_id, prerequisite_id)
        VALUES (v_fetishism_id, v_exploitation_id)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
