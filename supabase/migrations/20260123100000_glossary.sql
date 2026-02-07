-- ============================================
-- MARXIST GLOSSARY TABLE AND SEED DATA
-- ============================================

-- Drop existing table to recreate with correct schema
DROP TABLE IF EXISTS glossary CASCADE;
DROP INDEX IF EXISTS idx_glossary_term;
DROP INDEX IF EXISTS idx_glossary_type;

CREATE TABLE glossary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    term TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('person', 'organization', 'place', 'concept', 'publication', 'event', 'term')),
    explanation TEXT NOT NULL,
    url TEXT,
    related_terms TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_glossary_term ON glossary(term);
CREATE INDEX idx_glossary_type ON glossary(type);

-- RLS Policies
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Glossary entries are publicly readable"
    ON glossary FOR SELECT
    USING (true);

-- ============================================
-- AVAILABLE TYPES (CATEGORIES):
-- person, organization, place, concept, publication, event, term
-- ============================================

-- Add entries using:
-- INSERT INTO glossary (term, type, explanation) VALUES ('Term Name', 'type', 'Explanation text');
