-- Seed data for Physics Course: Classical Mechanics Fundamentals
-- This creates a complete introductory physics course with chapters, lessons, and exercises

-- Get Physics subject ID
DO $seed$
DECLARE
  physics_subject_id UUID;
  course_id UUID;
  ch1_id UUID;
  ch2_id UUID;
  ch3_id UUID;
  lesson_id UUID;
  test_id UUID;
BEGIN
  -- Get Physics subject
  SELECT id INTO physics_subject_id FROM stem_subjects WHERE slug = 'physics';

  -- Create the course
  INSERT INTO stem_courses (
    subject_id, title, slug, description, what_youll_learn, difficulty, estimated_hours, is_published
  ) VALUES (
    physics_subject_id,
    'Classical Mechanics Fundamentals',
    'classical-mechanics',
    'Master the foundational principles of classical mechanics, from Newton''s laws to energy conservation. This course provides a rigorous introduction to the physics that governs everyday motion.',
    '["Understand and apply Newton''s three laws of motion", "Analyze forces and free-body diagrams", "Calculate work, energy, and power in mechanical systems", "Apply conservation of momentum to collisions", "Solve problems involving rotational motion"]'::jsonb,
    'beginner',
    8,
    true
  ) RETURNING id INTO course_id;

  -- ==========================================
  -- CHAPTER 1: Introduction to Mechanics
  -- ==========================================
  INSERT INTO stem_chapters (course_id, title, slug, description, order_index)
  VALUES (course_id, 'Introduction to Mechanics', 'intro-mechanics', 'Fundamental concepts and mathematical foundations', 1)
  RETURNING id INTO ch1_id;

  -- Lesson 1.1: What is Mechanics?
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch1_id,
    'What is Mechanics?',
    'what-is-mechanics',
    'reading',
    'An overview of classical mechanics and its role in physics',
    '## What is Mechanics?

**Mechanics** is the branch of physics concerned with the motion of objects and the forces that cause or change that motion. It is one of the oldest and most fundamental areas of physics.

### The Two Branches of Mechanics

1. **Kinematics** - The study of motion without considering its causes
   - Describes *how* objects move
   - Uses quantities like position, velocity, and acceleration

2. **Dynamics** - The study of forces and their effects on motion
   - Explains *why* objects move
   - Uses Newton''s laws to relate force, mass, and acceleration

### Why Study Mechanics?

Classical mechanics forms the foundation for understanding:
- Engineering and machine design
- Planetary motion and space exploration
- Sports physics and biomechanics
- Everyday phenomena like driving, throwing, and falling

> "Mechanics is the paradise of the mathematical sciences because by means of it one comes to the fruits of mathematics." — Leonardo da Vinci

### Historical Context

Classical mechanics was developed primarily by:
- **Galileo Galilei** (1564–1642) - Pioneered experimental physics
- **Isaac Newton** (1643–1727) - Formulated the laws of motion
- **Leonhard Euler** (1707–1783) - Extended mechanics to rigid bodies

In the next lessons, we''ll build the mathematical tools needed to describe motion precisely.',
    10,
    1
  ) RETURNING id INTO lesson_id;

  -- Lesson 1.2: Units and Dimensions
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch1_id,
    'Units and Dimensions',
    'units-dimensions',
    'reading',
    'The SI system and dimensional analysis',
    '## Units and Dimensions

In physics, we express quantities using **units** - standardized measurements that allow us to communicate precisely.

### The SI System

The **International System of Units (SI)** defines seven base units:

| Quantity | Unit | Symbol |
|----------|------|--------|
| Length | meter | m |
| Mass | kilogram | kg |
| Time | second | s |
| Electric current | ampere | A |
| Temperature | kelvin | K |
| Amount of substance | mole | mol |
| Luminous intensity | candela | cd |

### Derived Units in Mechanics

From these base units, we derive:

- **Velocity**: m/s (meters per second)
- **Acceleration**: m/s² (meters per second squared)
- **Force**: N = kg·m/s² (Newton)
- **Energy**: J = kg·m²/s² (Joule)
- **Power**: W = kg·m²/s³ (Watt)

### Dimensional Analysis

Dimensional analysis is a powerful tool for:
1. Checking if equations are dimensionally consistent
2. Deriving relationships between quantities
3. Converting between unit systems

**Example**: Is the equation `v = at` dimensionally correct?

- Left side: [v] = m/s
- Right side: [a][t] = (m/s²)(s) = m/s ✓

The dimensions match, so the equation is dimensionally valid.',
    10,
    2
  ) RETURNING id INTO lesson_id;

  -- Add exercises for Units lesson
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES 
  (
    lesson_id,
    'multiple_choice',
    'What is the SI unit of force?',
    '["Joule", "Newton", "Watt", "Pascal"]'::jsonb,
    'Newton',
    'Force equals mass times acceleration. What unit represents kg·m/s²?',
    'The Newton (N) is the SI unit of force. 1 N = 1 kg·m/s², which is the force needed to accelerate a 1 kg mass at 1 m/s².',
    1
  ),
  (
    lesson_id,
    'numeric',
    'Convert 72 km/h to m/s. Enter your answer as a number.',
    NULL,
    '20',
    'Divide by 3.6 to convert km/h to m/s',
    '72 km/h = 72 × (1000 m / 3600 s) = 72 / 3.6 = 20 m/s',
    2
  );

  -- Lesson 1.3: Vectors and Scalars
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch1_id,
    'Vectors and Scalars',
    'vectors-scalars',
    'reading',
    'Understanding vector quantities and operations',
    '## Vectors and Scalars

Physical quantities in mechanics fall into two categories:

### Scalar Quantities
Scalars have only **magnitude** (size):
- Mass (5 kg)
- Time (3 seconds)
- Temperature (20°C)
- Speed (10 m/s)
- Energy (100 J)

### Vector Quantities
Vectors have both **magnitude** and **direction**:
- Displacement (5 m east)
- Velocity (10 m/s north)
- Acceleration (9.8 m/s² downward)
- Force (20 N at 30°)

### Vector Notation

Vectors are written as:
- Bold: **v** or **F**
- Arrow: →v or →F
- Component form: v = (vₓ, vᵧ)

### Vector Operations

**Addition**: Head-to-tail method or component-wise
```
A + B = (Aₓ + Bₓ, Aᵧ + Bᵧ)
```

**Magnitude**: 
```
|v| = √(vₓ² + vᵧ²)
```

**Unit vector**: A vector with magnitude 1
```
v̂ = v / |v|
```

### Components

Any 2D vector can be broken into perpendicular components:
```
vₓ = |v| cos(θ)
vᵧ = |v| sin(θ)
```

where θ is the angle from the positive x-axis.',
    10,
    3
  ) RETURNING id INTO lesson_id;

  -- Add exercises for Vectors lesson
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES 
  (
    lesson_id,
    'multiple_choice',
    'Which of the following is a vector quantity?',
    '["Mass", "Temperature", "Velocity", "Energy"]'::jsonb,
    'Velocity',
    'Which quantity requires both magnitude AND direction to be fully described?',
    'Velocity is a vector because it includes both speed (magnitude) and direction. Mass, temperature, and energy are scalars with only magnitude.',
    1
  ),
  (
    lesson_id,
    'numeric',
    'A vector has components (3, 4). What is its magnitude?',
    NULL,
    '5',
    'Use the Pythagorean theorem: |v| = √(vₓ² + vᵧ²)',
    'Magnitude = √(3² + 4²) = √(9 + 16) = √25 = 5',
    2
  );

  -- Chapter 1 Test
  INSERT INTO stem_chapter_tests (chapter_id, title, passing_score, time_limit_minutes)
  VALUES (ch1_id, 'Chapter 1 Test: Foundations', 70, 15)
  RETURNING id INTO test_id;

  INSERT INTO stem_test_questions (test_id, question, question_type, options, correct_answer, explanation, points, order_index)
  VALUES
  (test_id, 'Kinematics is the study of:', 'multiple_choice', 
   '["Forces and their effects", "Motion without considering causes", "Energy transformations", "Wave phenomena"]'::jsonb,
   'Motion without considering causes', 'Kinematics describes how objects move (position, velocity, acceleration) without asking why.', 1, 1),
  (test_id, 'The SI unit of acceleration is:', 'multiple_choice',
   '["m/s", "m/s²", "kg·m/s", "N/m"]'::jsonb,
   'm/s²', 'Acceleration is the rate of change of velocity (m/s) over time (s), giving m/s².', 1, 2),
  (test_id, 'Force is a vector quantity.', 'true_false', NULL, 'true',
   'Force has both magnitude and direction, making it a vector.', 1, 3);

  -- ==========================================
  -- CHAPTER 2: Newton''s Laws of Motion
  -- ==========================================
  INSERT INTO stem_chapters (course_id, title, slug, description, order_index)
  VALUES (course_id, 'Newton''s Laws of Motion', 'newtons-laws', 'The three fundamental laws governing motion', 2)
  RETURNING id INTO ch2_id;

  -- Lesson 2.1: Newton''s First Law
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch2_id,
    'Newton''s First Law: Inertia',
    'first-law',
    'reading',
    'Understanding inertia and the law of motion in absence of forces',
    '## Newton''s First Law: The Law of Inertia

> **An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction, unless acted upon by an unbalanced force.**

### Understanding Inertia

**Inertia** is the tendency of an object to resist changes in its state of motion.

Key points:
- Objects don''t "want" to move or stop — they simply maintain their current state
- Mass is a measure of inertia: more mass = more resistance to change
- A 1 kg ball is easier to accelerate than a 100 kg boulder

### Equilibrium

When all forces on an object balance out (net force = 0):
- **Static equilibrium**: Object at rest remains at rest
- **Dynamic equilibrium**: Object in motion continues at constant velocity

### Inertial Reference Frames

Newton''s laws only work in **inertial reference frames** — frames that aren''t accelerating.

Examples:
- ✓ A lab on Earth (approximately inertial for most experiments)
- ✓ A spaceship drifting at constant velocity
- ✗ A car during braking (non-inertial)
- ✗ A spinning merry-go-round (non-inertial)

### Everyday Examples

1. **Seatbelts**: When a car stops suddenly, your body tends to keep moving forward
2. **Tablecloth trick**: A quick pull leaves dishes in place due to their inertia
3. **Ketchup bottle**: Shaking then stopping abruptly moves the ketchup out',
    10,
    1
  ) RETURNING id INTO lesson_id;

  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES 
  (
    lesson_id,
    'multiple_choice',
    'A hockey puck sliding on frictionless ice will:',
    '["Gradually slow down", "Speed up over time", "Continue at constant velocity", "Immediately stop"]'::jsonb,
    'Continue at constant velocity',
    'Think about what happens when there are no unbalanced forces.',
    'According to Newton''s First Law, without friction or other forces, the puck maintains its velocity indefinitely.',
    1
  );

  -- Lesson 2.2: Newton''s Second Law
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch2_id,
    'Newton''s Second Law: F = ma',
    'second-law',
    'reading',
    'The relationship between force, mass, and acceleration',
    '## Newton''s Second Law: F = ma

> **The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.**

### The Equation

$$\vec{F}_{net} = m\vec{a}$$

Or in scalar form for one dimension:
```
F = ma
```

Where:
- **F** = net force (Newtons, N)
- **m** = mass (kilograms, kg)  
- **a** = acceleration (m/s²)

### Understanding the Relationship

1. **More force → more acceleration** (for same mass)
   - Push harder, accelerate faster

2. **More mass → less acceleration** (for same force)
   - Heavier objects are harder to accelerate

3. **Force and acceleration are vectors** pointing in the same direction

### Free-Body Diagrams

To apply F = ma:
1. Isolate the object of interest
2. Draw ALL forces acting ON the object
3. Choose a coordinate system
4. Apply F = ma in each direction

### Key Examples

**Example 1**: A 5 kg box is pushed with 20 N. What''s the acceleration?
```
a = F/m = 20 N / 5 kg = 4 m/s²
```

**Example 2**: What force accelerates a 1000 kg car at 3 m/s²?
```
F = ma = 1000 kg × 3 m/s² = 3000 N
```

### Weight vs. Mass

- **Mass** (m): Amount of matter, constant everywhere
- **Weight** (W): Gravitational force, W = mg

On Earth: g ≈ 9.8 m/s²
On Moon: g ≈ 1.6 m/s²',
    15,
    2
  ) RETURNING id INTO lesson_id;

  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES 
  (
    lesson_id,
    'numeric',
    'A 10 kg object experiences a net force of 50 N. What is its acceleration in m/s²?',
    NULL,
    '5',
    'Use F = ma and solve for a',
    'a = F/m = 50 N / 10 kg = 5 m/s²',
    1
  ),
  (
    lesson_id,
    'numeric',
    'What is the weight (in Newtons) of a 70 kg person on Earth? Use g = 10 m/s².',
    NULL,
    '700',
    'Weight = mass × gravitational acceleration',
    'W = mg = 70 kg × 10 m/s² = 700 N',
    2
  );

  -- Lesson 2.3: Newton''s Third Law
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch2_id,
    'Newton''s Third Law: Action-Reaction',
    'third-law',
    'reading',
    'Understanding action-reaction force pairs',
    '## Newton''s Third Law: Action and Reaction

> **For every action, there is an equal and opposite reaction.**

### Understanding Force Pairs

When object A exerts a force on object B, object B **simultaneously** exerts an equal and opposite force on object A.

$$\vec{F}_{A→B} = -\vec{F}_{B→A}$$

### Key Characteristics of Action-Reaction Pairs

1. **Equal magnitude**: Both forces have the same size
2. **Opposite direction**: Forces point in opposite directions
3. **Different objects**: Forces act on DIFFERENT objects
4. **Same type**: Both forces are of the same nature (gravity-gravity, contact-contact)
5. **Simultaneous**: They exist at the same instant

### Common Misconceptions

❌ "Action-reaction pairs cancel out"
✓ They act on different objects, so they can''t cancel

❌ "The action comes before the reaction"  
✓ They occur simultaneously

### Examples

**Walking**: 
- You push backward on the floor
- Floor pushes you forward

**Rocket propulsion**:
- Rocket pushes exhaust gases backward
- Gases push rocket forward

**Earth-Apple**:
- Earth pulls apple down (weight)
- Apple pulls Earth up (with the same force!)

### Why Don''t They Cancel?

Consider a book on a table:
- Weight (Earth on book) and normal force (table on book) are NOT an action-reaction pair
- They happen to balance, but they''re different types of forces on the same object

The true pairs are:
- Earth pulls book ↔ Book pulls Earth
- Book pushes table ↔ Table pushes book',
    10,
    3
  ) RETURNING id INTO lesson_id;

  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES 
  (
    lesson_id,
    'multiple_choice',
    'When you push against a wall, the wall pushes back. These two forces:',
    '["Cancel each other out", "Act on different objects", "Are not equal in magnitude", "Have the same direction"]'::jsonb,
    'Act on different objects',
    'Think about what object each force acts upon.',
    'Your push acts on the wall, and the wall''s push acts on you. They''re on different objects so they don''t cancel.',
    1
  );

  -- ==========================================
  -- CHAPTER 3: Work, Energy, and Power
  -- ==========================================
  INSERT INTO stem_chapters (course_id, title, slug, description, order_index)
  VALUES (course_id, 'Work, Energy, and Power', 'work-energy', 'Understanding energy transformations in mechanical systems', 3)
  RETURNING id INTO ch3_id;

  -- Lesson 3.1: Work
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch3_id,
    'Work in Physics',
    'work',
    'reading',
    'The physics definition of work and how to calculate it',
    '## Work in Physics

In physics, **work** has a precise definition different from everyday usage.

### Definition

Work is done when a force causes displacement:

$$W = \vec{F} \cdot \vec{d} = Fd\cos\theta$$

Where:
- **W** = work (Joules, J)
- **F** = force magnitude (N)
- **d** = displacement magnitude (m)
- **θ** = angle between force and displacement

### Key Points

1. **Work is a scalar** (no direction)
2. **Work can be positive, negative, or zero**:
   - Positive: Force and displacement in same direction (θ < 90°)
   - Negative: Force opposes displacement (θ > 90°)
   - Zero: Force perpendicular to displacement (θ = 90°)

### Examples

**Lifting a book** (θ = 0°):
```
W = Fd cos(0°) = Fd × 1 = Fd > 0
```

**Lowering a book** (θ = 180°):
```
W = Fd cos(180°) = Fd × (-1) = -Fd < 0
```

**Carrying a book horizontally** (θ = 90°):
```
W = Fd cos(90°) = Fd × 0 = 0
```

### Units

1 Joule = 1 Newton × 1 meter = 1 kg·m²/s²

### Work by Gravity

For an object moving vertically:
```
W_gravity = mgh
```
(positive going down, negative going up)',
    10,
    1
  ) RETURNING id INTO lesson_id;

  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES 
  (
    lesson_id,
    'numeric',
    'A 50 N force pushes a box 4 meters in the direction of the force. How much work is done (in Joules)?',
    NULL,
    '200',
    'When force and displacement are parallel, W = F × d',
    'W = Fd cos(0°) = 50 N × 4 m × 1 = 200 J',
    1
  );

  -- Lesson 3.2: Kinetic and Potential Energy
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch3_id,
    'Kinetic and Potential Energy',
    'kinetic-potential-energy',
    'reading',
    'The two main forms of mechanical energy',
    '## Kinetic and Potential Energy

Energy is the capacity to do work. Mechanical energy comes in two forms.

### Kinetic Energy (KE)

Energy of motion:

$$KE = \frac{1}{2}mv^2$$

Where:
- m = mass (kg)
- v = speed (m/s)

**Key properties**:
- Always positive (v² is always positive)
- Doubles when velocity doubles? No — it quadruples!
- Depends on reference frame

### Potential Energy (PE)

Stored energy due to position or configuration:

**Gravitational PE** (near Earth''s surface):
$$PE = mgh$$

Where:
- m = mass (kg)
- g = 9.8 m/s²
- h = height above reference point (m)

**Elastic PE** (spring):
$$PE = \frac{1}{2}kx^2$$

Where:
- k = spring constant (N/m)
- x = displacement from equilibrium (m)

### Work-Energy Theorem

The net work done on an object equals its change in kinetic energy:

$$W_{net} = \Delta KE = KE_f - KE_i$$

### Conservation of Mechanical Energy

In the absence of non-conservative forces (like friction):

$$KE_i + PE_i = KE_f + PE_f$$

Or:
$$E_{mechanical} = constant$$

**Example**: A ball dropped from height h:
- At top: KE = 0, PE = mgh
- At bottom: KE = mgh, PE = 0
- Total energy is conserved!',
    15,
    2
  ) RETURNING id INTO lesson_id;

  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES 
  (
    lesson_id,
    'numeric',
    'A 2 kg ball moves at 3 m/s. What is its kinetic energy in Joules?',
    NULL,
    '9',
    'Use KE = (1/2)mv²',
    'KE = (1/2)(2 kg)(3 m/s)² = (1/2)(2)(9) = 9 J',
    1
  ),
  (
    lesson_id,
    'numeric',
    'A 5 kg object is lifted 4 meters. What is the change in gravitational PE? Use g = 10 m/s².',
    NULL,
    '200',
    'PE = mgh',
    'ΔPE = mgh = 5 kg × 10 m/s² × 4 m = 200 J',
    2
  );

  RAISE NOTICE 'Physics course seeded successfully!';
END $seed$;
