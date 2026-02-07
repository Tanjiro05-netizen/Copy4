-- =============================================
-- REMOVE SEED DATA
-- Delete all pre-seeded quizzes, questions, and cells
-- =============================================

-- Delete all quiz questions
DELETE FROM knowledge_quiz_questions;

-- Delete all quizzes
DELETE FROM knowledge_quizzes;

-- Delete all cell members
DELETE FROM knowledge_cell_members;

-- Delete all cells
DELETE FROM knowledge_cells;

-- Delete all digital library books (dummy/seed data)
DELETE FROM digital_library_books;
