-- Add 4 additional exercises for Lesson 1.2 (Mathematics for Physics)
-- in the Introductory Physics I course

DO $seed$
DECLARE
  target_lesson_id UUID;
BEGIN
  -- Find Lesson 1.2 by slug within the intro-physics-mechanics course
  SELECT l.id INTO target_lesson_id
  FROM stem_lessons l
  JOIN stem_chapters ch ON l.chapter_id = ch.id
  JOIN stem_courses c ON ch.course_id = c.id
  WHERE c.slug = 'intro-physics-mechanics'
    AND l.slug = 'math-for-physics';

  IF target_lesson_id IS NULL THEN
    RAISE NOTICE 'Lesson math-for-physics not found, skipping exercises.';
    RETURN;
  END IF;

  -- Exercise 1.2.3: Integration
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    target_lesson_id,
    'multiple_choice',
    'What is the integral ∫ 2t dt from 0 to T?',
    '["T²", "2T", "T²/2", "2T²"]'::jsonb,
    'T²',
    'Use the power rule: ∫ t^n dt = t^(n+1)/(n+1). Here n=1.',
    '∫ 2t dt = 2 · t²/2 = t². Evaluating from 0 to T gives T² - 0 = T².',
    3
  );

  -- Exercise 1.2.4: Dot product
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    target_lesson_id,
    'numeric',
    'Calculate the dot product of vectors A = (3, 4) and B = (2, -1).',
    NULL,
    '2',
    'The dot product A·B = Ax·Bx + Ay·By.',
    'A·B = (3)(2) + (4)(-1) = 6 - 4 = 2.',
    4
  );

  -- Exercise 1.2.5: Cross product direction
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    target_lesson_id,
    'multiple_choice',
    'If vector A points in the +x direction and vector B points in the +y direction, what direction does A × B point?',
    '["+z direction", "-z direction", "+x direction", "-y direction"]'::jsonb,
    '+z direction',
    'Use the right-hand rule: curl fingers from A toward B, your thumb points in the direction of A × B.',
    'By the right-hand rule, x̂ × ŷ = ẑ. Curling fingers from +x to +y, the thumb points in the +z direction.',
    5
  );

  -- Exercise 1.2.6: Vector magnitude
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    target_lesson_id,
    'numeric',
    'A velocity vector has components vx = 3 m/s and vy = 4 m/s. What is the magnitude of the velocity in m/s?',
    NULL,
    '5',
    'Use the Pythagorean theorem: |v| = √(vx² + vy²).',
    '|v| = √(3² + 4²) = √(9 + 16) = √25 = 5 m/s.',
    6
  );

END $seed$;
