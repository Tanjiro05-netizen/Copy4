-- Seed data for Physics Course: Introductory Physics I: Elementary Mechanics
-- A comprehensive calculus-based intro to classical mechanics (5 chapters, 14 lessons)

DO $seed$
DECLARE
  physics_subject_id UUID;
  course_id UUID;
  ch1_id UUID;
  ch2_id UUID;
  ch3_id UUID;
  ch4_id UUID;
  ch5_id UUID;
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
    'Introductory Physics I: Elementary Mechanics',
    'intro-physics-mechanics',
    'A comprehensive calculus-based introduction to classical mechanics, covering Newton''s laws, energy, momentum, rotation, fluids, oscillations, waves, and gravity. Designed for STEM students with a solid foundation in single-variable calculus.',
    '["Master Newton''s Laws of Motion and apply them to solve complex problems", "Understand and apply conservation laws for energy and momentum", "Analyze rotational motion and angular momentum", "Solve problems involving fluids, oscillations, and waves", "Apply gravitational principles to orbital mechanics"]'::jsonb,
    'intermediate',
    48,
    true
  ) RETURNING id INTO course_id;

  -- ==========================================
  -- CHAPTER 1: Getting Ready to Learn Physics
  -- ==========================================
  INSERT INTO stem_chapters (course_id, title, slug, description, order_index)
  VALUES (course_id, 'Getting Ready to Learn Physics', 'getting-ready',
    'Essential study skills and mathematical preparation for success in physics. Learn effective learning strategies and review the calculus needed for the course.', 1)
  RETURNING id INTO ch1_id;

  -- Lesson 1.1: How to Learn Physics
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch1_id,
    'How to Learn Physics',
    'how-to-learn-physics',
    'reading',
    'Master the art of learning physics through active engagement, group study, and the proven "See, Do, Teach" methodology.',
    '## The Art of Learning Physics

Physics is not a subject you can master through passive listening or rote memorization. Success requires **active engagement** with the material. This lesson introduces proven strategies for efficient physics learning.

### The See, Do, Teach Method

Medical schools use a compressed learning adage: **"See one, do one, teach one."** This recipe works for physics too:

1. **See** - Observe concepts being applied (lecture, demonstrations)
2. **Do** - Solve problems yourself, with guidance
3. **Teach** - Explain concepts to peers

> "Teaching each other in a peer setting is essential! This problem you ''get'', and teach others — you actually learn it better from teaching it than they do from your presentation."

### Why Group Study Works

Working in groups dramatically improves learning because:
- Discussion forces articulation of ideas
- Problem-solving becomes collaborative exploration
- Teaching opportunities arise naturally
- Multiple perspectives help overcome stuck points

### The Method of Three Passes

For homework and problem-solving:

**Pass 1** (3+ nights before due):
- Spend 1-1.5 hours on all problems
- 6-8 minutes per problem maximum
- Do right before bed, then sleep

**Pass 2** (after one night''s sleep):
- Review solved problems quickly
- Focus 10+ minutes on unsolved problems
- Again, do before bed

**Pass 3** (final pass):
- Review all previously solved problems
- Spend 15+ minutes on remaining problems
- Leave only 2-3 "impossible" problems for recitation

### Key Requirements for Learning

| Factor | Why It Matters |
|--------|----------------|
| Sleep | Long-term memory forms during sleep cycles |
| Nutrition | Brain burns 20-30% of daily calories; needs glucose |
| Exercise | Increases oxygen supply to the brain |
| Positive attitude | Emotional engagement enhances memory formation |
| Pattern recognition | Brains compress information through patterns |

### Summary

- Physics requires **active learning**, not passive listening
- **Group study** with peer teaching is highly effective
- Use the **three-pass method** for problem sets
- Get adequate sleep, nutrition, and exercise
- Maintain a positive, engaged attitude',
    10,
    1
  ) RETURNING id INTO lesson_id;

  -- Exercise 1.1.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'Which learning methodology is most effective for mastering physics according to research?',
    '["Memorizing formulas from a textbook", "Passive lecture attendance and note-taking", "Active engagement with See, Do, Teach methodology", "Cramming the night before exams"]'::jsonb,
    'Active engagement with See, Do, Teach methodology',
    'Consider which approach engages multiple parts of your brain and provides opportunities for both consumption and production of knowledge.',
    'The "See, Do, Teach" methodology is proven most effective because it combines observation, hands-on practice, and peer teaching — engaging both hemispheres of the brain and creating multiple memory pathways.',
    1
  );

  -- Exercise 1.1.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'fill_blank',
    'The three components of the medical school learning method applied to physics are: See one, ___ one, teach one.',
    NULL,
    'do',
    'What comes between observing and teaching? You need to practice the skill yourself.',
    'The complete method is "See one, do one, teach one" — observation, practice, then instruction.',
    2
  );

  -- Lesson 1.2: Mathematics for Physics
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch1_id,
    'Mathematics for Physics',
    'math-for-physics',
    'reading',
    'Review the essential calculus, vectors, and algebra skills needed for introductory physics.',
    '## Essential Mathematics for Physics

Physics requires a solid foundation in mathematics through single-variable calculus. This lesson reviews the key mathematical tools you''ll use throughout this course.

### Prerequisites

You should be comfortable with:
- **Algebra** - Solving equations, manipulating expressions
- **Geometry and Trigonometry** - Angles, triangles, periodic functions
- **Single-variable calculus** - Derivatives and integrals

### The Five Essential Calculus Rules

For physics, you need only five basic differentiation/integration rules plus the product and chain rules:

**1. Power Rule**
```
d(u^n)/du = n*u^(n-1)
∫ u^n du = u^(n+1)/(n+1) + C
```

**2. Natural Logarithm**
```
d(ln|u|)/du = 1/u
∫ du/u = ln|u| + C
```

**3. Exponential Function**
```
d(e^u)/du = e^u
∫ e^u du = e^u + C
```

**4. Sine and Cosine**
```
d(sin u)/du = cos u       ∫ cos u du = sin u + C
d(cos u)/du = -sin u      ∫ sin u du = -cos u + C
```

**5. Hyperbolic Functions**
```
d(sinh u)/du = cosh u     ∫ cosh u du = sinh u + C
d(cosh u)/du = sinh u     ∫ sinh u du = cosh u + C
```

### Vector Operations

Physics is inherently three-dimensional. You must understand:

**Vector Components:**
```
Ax = A cos(θ)
Ay = A sin(θ)
```

**Vector Addition:**
```
A⃗ + B⃗ = (Ax + Bx) x̂ + (Ay + By) ŷ
```

**Dot Product:**
```
A⃗ · B⃗ = Ax*Bx + Ay*By = |A||B|cos(θ)
```

**Cross Product:**
```
|A⃗ × B⃗| = |A||B|sin(θ)
```

### SI Units

| Quantity | Unit | Symbol |
|----------|------|--------|
| Length | meter | m |
| Time | second | s |
| Mass | kilogram | kg |
| Force | Newton | N = kg·m/s² |

> "The fundamental calculus formulas needed to completely master a one-year introductory physics sequence can easily fit on one single page."

### Summary

- Master the five basic calculus rules plus product and chain rules
- Understand vector operations: components, addition, dot and cross products
- Use SI units consistently: meters, seconds, kilograms
- Algebra is more important than arithmetic — focus on symbolic manipulation',
    15,
    2
  ) RETURNING id INTO lesson_id;

  -- Exercise 1.2.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'What is the derivative of sin(ωt + δ) with respect to t?',
    '["ω cos(ωt + δ)", "-ω sin(ωt + δ)", "cos(ωt + δ)", "-ω cos(ωt + δ)"]'::jsonb,
    'ω cos(ωt + δ)',
    'Apply the chain rule: d/dt[sin(u)] = cos(u) · du/dt where u = ωt + δ.',
    'Using the chain rule: d/dt[sin(ωt + δ)] = cos(ωt + δ) · d/dt(ωt + δ) = cos(ωt + δ) · ω = ω cos(ωt + δ).',
    1
  );

  -- Exercise 1.2.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A vector has magnitude 10 and makes an angle of 30° with the positive x-axis. What is its x-component? (Round to one decimal place)',
    NULL,
    '8.7',
    'Use Ax = A cos(θ). Remember that cos(30°) = √3/2 ≈ 0.866.',
    'Ax = 10 × cos(30°) = 10 × 0.866 = 8.66 ≈ 8.7',
    2
  );

  -- Chapter 1 Test
  INSERT INTO stem_chapter_tests (chapter_id, title, passing_score, time_limit_minutes)
  VALUES (ch1_id, 'Chapter 1 Test: Getting Ready', 70, 15)
  RETURNING id INTO test_id;

  INSERT INTO stem_test_questions (test_id, question, question_type, options, correct_answer, explanation, points, order_index)
  VALUES
  (test_id, 'Which of the following is NOT one of the three passes recommended for homework?', 'multiple_choice',
   '["Fast pass 3+ nights before due", "Medium pass after one night''s sleep", "Final pass with 15+ minutes per problem", "Cramming pass the night before"]'::jsonb,
   'Cramming pass the night before',
   'The three-pass method explicitly avoids cramming. The passes are: (1) Fast pass early, (2) Medium pass after sleep, (3) Final pass with extended time.', 1, 1),
  (test_id, 'The SI unit of force is the Newton, which equals:', 'multiple_choice',
   '["kg·m/s", "kg·m/s²", "kg·m²/s", "kg²·m/s"]'::jsonb,
   'kg·m/s²',
   'From F = ma, force has units of mass × acceleration = kg × (m/s²) = kg·m/s², defined as one Newton.', 1, 2),
  (test_id, 'What is ∫ cos(x) dx?', 'multiple_choice',
   '["sin(x) + C", "-sin(x) + C", "cos(x) + C", "-cos(x) + C"]'::jsonb,
   'sin(x) + C',
   'The integral of cosine is sine, plus an arbitrary constant of integration.', 1, 3);

  -- ==========================================
  -- CHAPTER 2: Newton''s Laws
  -- ==========================================
  INSERT INTO stem_chapters (course_id, title, slug, description, order_index)
  VALUES (course_id, 'Newton''s Laws', 'newtons-laws',
    'The foundation of classical mechanics: Newton''s three laws of motion, force analysis, and problem-solving strategies for dynamics.', 2)
  RETURNING id INTO ch2_id;

  -- Lesson 2.1: Introduction to Dynamics
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch2_id,
    'Introduction to Dynamics',
    'intro-dynamics',
    'reading',
    'Understand physics as the study of dynamics and learn how Newton''s laws provide a mathematical framework for describing motion.',
    '## Introduction to Dynamics

Dynamics is the description of the actual forces of nature that underlie the causal structure of the Universe. This lesson introduces Newton''s revolutionary approach to understanding motion.

### Physics as a Language

Physics is a language — specifically, the language of a worldview expressed through mathematics. The components are:
- **Coordinates** - Numbers with units describing position, time, mass
- **Laws of Nature** - Mathematical postulates that predict phenomena
- **Units** - SI units (meters, seconds, kilograms) for consistency

### Newton''s Three Laws

**First Law: Law of Inertia**

> Objects at rest or in uniform motion remain so unless acted upon by an unbalanced force.

```
ΣF⃗i = 0 = ma⃗  ⇒  v⃗ = constant
```

**Second Law: Law of Dynamics**

> The net force on an object equals its mass times acceleration.

```
F⃗ = ΣF⃗i = ma⃗ = d(mv⃗)/dt = dp⃗/dt
```

where p⃗ = mv⃗ is the momentum.

**Third Law: Law of Reaction**

> If object B exerts force F⃗AB on object A, then A exerts equal and opposite force F⃗BA = -F⃗AB on B.

```
F⃗ij = -F⃗ji    or    Σ(i,j) F⃗ij = 0
```

### Inertial Reference Frames

An inertial reference frame is a coordinate system that is:
- At rest, OR
- Moving at constant velocity (non-accelerating)

All three laws assume an inertial frame. Examples:
- ✓ Ground/lab frame (approximately inertial)
- ✓ Car at constant speed on straight road
- ✗ A car during braking (non-inertial)
- ✗ A spinning merry-go-round (non-inertial)

### The Forces of Nature

From weakest to strongest:

| Force | Range | Relative Strength |
|-------|-------|-------------------|
| Gravity | Infinite | 1 |
| Weak Nuclear | 10⁻¹⁸ m | 10²⁵ |
| Electromagnetic | Infinite | 10³⁶ |
| Strong Nuclear | 10⁻¹⁵ m | 10³⁸ |

> "Newton''s Laws, as it happens, are only approximately true — they are ''exact'' for massive, large objects moving slowly compared to the speed of light."

### Summary

- Physics describes nature through mathematical laws
- Newton''s three laws form the foundation of classical mechanics
- Laws apply only in inertial reference frames
- Four fundamental forces govern all interactions',
    10,
    1
  ) RETURNING id INTO lesson_id;

  -- Exercise 2.1.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'According to Newton''s First Law, what happens to an object in motion when no net force acts on it?',
    '["It slows down and stops", "It continues in uniform motion", "It accelerates uniformly", "It changes direction randomly"]'::jsonb,
    'It continues in uniform motion',
    'The First Law is also called the Law of Inertia — objects resist changes to their state of motion.',
    'Newton''s First Law states that objects in uniform motion remain in uniform motion unless acted upon by an unbalanced force.',
    1
  );

  -- Exercise 2.1.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A 5 kg object experiences a net force of 20 N. What is its acceleration in m/s²?',
    NULL,
    '4',
    'Use Newton''s Second Law: F = ma, so a = F/m.',
    'From F = ma: a = F/m = 20 N / 5 kg = 4 m/s²',
    2
  );

  -- Lesson 2.2: Force Rules and Free-Body Diagrams
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch2_id,
    'Force Rules and Free-Body Diagrams',
    'force-rules',
    'reading',
    'Learn the common force rules and master the art of drawing free-body diagrams for solving mechanics problems.',
    '## Force Rules and Problem-Solving

To apply Newton''s Second Law, you need to identify all forces acting on an object. This lesson covers the essential force rules and problem-solving methodology.

### Essential Force Rules

**1. Gravity (Near Earth''s Surface)**
```
Fg = mg    (downward)
```
where g ≈ 9.8 m/s² (or 10 m/s² for estimation)

**2. Spring Force (Hooke''s Law)**
```
Fx = -kΔx
```
where k is spring constant and Δx is displacement from equilibrium.

**3. Normal Force**
```
F⊥ = N    (perpendicular to surface, outward)
```
This is a constraint force — its magnitude adjusts to prevent objects from interpenetrating.

**4. Tension**
```
Fs = T    (along string, pulling both ends)
```
For massless, unstretchable strings, tension is constant throughout.

**5. Static Friction**
```
fs ≤ μsN    (opposes impending motion)
```
Static friction is also a constraint force — it adjusts up to its maximum.

**6. Kinetic Friction**
```
fk = μkN    (opposes actual motion)
```
Kinetic friction has a fixed value once sliding begins.

### The Problem-Solving Recipe

1. **Draw a Picture** - Visualize the situation
2. **Free-Body Diagram** - Draw all forces on each object
3. **Choose Coordinates** - Select a coordinate system
4. **Decompose Forces** - Break forces into components
5. **Apply Newton''s Second Law** - Write ΣF = ma for each dimension
6. **Solve the Equations** - Find accelerations, integrate
7. **Answer the Questions** - Use your solutions

### Example: Mass on a Spring in Equilibrium

A mass m hangs from a spring with constant k. At equilibrium:
```
Fy = kΔx - mg = 0
Δx = mg/k
```

### Summary

- Know the force rules: gravity, spring, normal, tension, friction
- Draw free-body diagrams for every problem
- Follow the systematic recipe for problem-solving
- Remember that constraint forces (normal, static friction) adjust to conditions',
    15,
    2
  ) RETURNING id INTO lesson_id;

  -- Exercise 2.2.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'A 2 kg mass hangs from a spring with k = 50 N/m. How far is the spring stretched at equilibrium? (Use g = 10 m/s²)',
    '["0.2 m", "0.4 m", "0.8 m", "1.0 m"]'::jsonb,
    '0.4 m',
    'At equilibrium, spring force balances gravity: kΔx = mg.',
    'Δx = mg/k = (2 kg × 10 m/s²) / 50 N/m = 20/50 = 0.4 m',
    1
  );

  -- Exercise 2.2.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'fill_blank',
    'Hooke''s Law states that the spring force is proportional to the ___ from equilibrium.',
    NULL,
    'displacement',
    'The spring force depends on how far the spring is stretched or compressed from its natural length.',
    'Hooke''s Law: F = -kΔx, where Δx is the displacement from equilibrium position.',
    2
  );

  -- Lesson 2.3: Motion in One Dimension
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch2_id,
    'Motion in One Dimension',
    'one-d-motion',
    'reading',
    'Apply Newton''s Second Law to solve problems involving constant acceleration, including falling objects and motion with applied forces.',
    '## Solving One-Dimensional Motion Problems

With Newton''s Second Law and the force rules, we can solve for the motion of objects.

### Constant Acceleration

Starting from:
```
a = dv/dt = constant = a₀
```

First integration (velocity):
```
v(t) = a₀t + v₀
```

Second integration (position):
```
x(t) = ½a₀t² + v₀t + x₀
```

### Example: Falling Object

A mass m is dropped from height H. Find time to hit ground and velocity at impact.

Coordinate system: +y upward, ground at y = 0.

```
ay = -g
v(t) = -gt
y(t) = -½gt² + H
```

Time to hit ground (y = 0):
```
t = √(2H/g)
```

Velocity at impact:
```
v = -√(2gH)
```

### Example: Constant Applied Force

A car of mass m starts at x₀ with velocity v₀. A constant force F is applied:
```
v(t) = (F/m)t + v₀
x(t) = (F/2m)t² + v₀t + x₀
```

### Summary

- For constant acceleration, use the kinematic equations
- Integration of acceleration gives velocity; integration of velocity gives position
- Always apply initial conditions to find constants
- The sign of acceleration depends on your coordinate choice',
    20,
    3
  ) RETURNING id INTO lesson_id;

  -- Exercise 2.3.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'An object is dropped from a height of 80 meters. How long does it take to reach the ground? (Use g = 10 m/s²)',
    NULL,
    '4',
    'Use t = √(2H/g). Note that 2H/g = 160/10 = 16.',
    't = √(2 × 80 / 10) = √16 = 4 seconds',
    1
  );

  -- Exercise 2.3.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A 1000 kg car accelerates from rest with a constant force of 2000 N. How far does it travel in 5 seconds?',
    NULL,
    '25',
    'First find acceleration: a = F/m. Then use x = ½at² with v₀ = 0 and x₀ = 0.',
    'a = 2000 N / 1000 kg = 2 m/s². x = ½ × 2 × (5)² = 25 meters',
    2
  );

  -- Lesson 2.4: Motion in Two Dimensions
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch2_id,
    'Motion in Two Dimensions',
    'two-d-motion',
    'reading',
    'Extend Newton''s laws to two-dimensional motion, including projectile motion and problems on inclined planes.',
    '## Two-Dimensional Motion

Real-world motion often occurs in two or three dimensions.

### Projectile Motion

For projectiles near Earth''s surface (ignoring air resistance):
- Horizontal: No acceleration (aₓ = 0)
- Vertical: Constant acceleration (ay = -g)

Equations:
```
x(t) = v₀cos(θ)t
y(t) = -½gt² + v₀sin(θ)t + y₀
```

### The Inclined Plane

For an object on a frictionless incline at angle θ:

Coordinate choice: x-axis down the incline, y-axis perpendicular

```
Fx = mg sin(θ)    (down the incline)
Fy = mg cos(θ) - N = 0    (perpendicular)
```

Acceleration:
```
ax = g sin(θ)
```

> "The acceleration down a frictionless incline depends only on g and the angle, not on mass."

### Example: Block Sliding Down Incline

A block slides down a frictionless incline of angle θ and length L:
```
a = g sin(θ)
t = √(2L/(g sin(θ)))
v = √(2gL sin(θ))
```

### Summary

- Projectile motion separates into independent horizontal and vertical components
- Inclined plane problems are simplified by choosing coordinates along and perpendicular to the surface
- The angle determines how much gravity contributes to motion along the surface
- Always choose coordinates wisely to minimize calculations',
    20,
    4
  ) RETURNING id INTO lesson_id;

  -- Exercise 2.4.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'A projectile is launched horizontally from a height of 20 m. How long does it take to hit the ground? (Use g = 10 m/s²)',
    '["1 s", "2 s", "4 s", "√2 s"]'::jsonb,
    '2 s',
    'Horizontal motion doesn''t affect vertical fall time. Use y = -½gt² with y = -20 m.',
    '-20 = -½ × 10 × t² → t² = 4 → t = 2 s',
    1
  );

  -- Exercise 2.4.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A block slides down a frictionless 30° incline. What is its acceleration in m/s²? (Use g = 10 m/s²)',
    NULL,
    '5',
    'On a frictionless incline, a = g sin(θ). What is sin(30°)?',
    'a = g sin(30°) = 10 × 0.5 = 5 m/s²',
    2
  );

  -- Lesson 2.5: Circular Motion
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch2_id,
    'Circular Motion',
    'circular-motion',
    'reading',
    'Analyze objects moving in circular paths, understanding centripetal acceleration and the forces required to maintain circular motion.',
    '## Circular Motion

When an object moves in a circle, its velocity is always changing direction, which means it is accelerating.

### Tangential Velocity

For circular motion with radius r:
```
v = rω
```
where ω is the angular velocity in radians per second.

### Centripetal Acceleration

Even at constant speed, circular motion involves acceleration because the direction of velocity changes.

Centripetal acceleration (pointing toward the center):
```
ac = v²/r = rω²
```

### Forces in Circular Motion

From Newton''s Second Law:
```
Fc = mv²/r = mrω²
```

This "centripetal force" is not a new type of force — it is the net result of real forces (tension, gravity, normal force, friction) that happen to point toward the center.

### Example: Ball on a String

A ball of mass m swings in a horizontal circle of radius r at constant speed v:
```
T = mv²/r
```

### Example: Conical Pendulum

A mass m on a string of length L swings in a horizontal circle, making angle θ with the vertical:

Vertical: T cos(θ) = mg
Horizontal: T sin(θ) = mv²/r = mrω²

With r = L sin(θ):
```
ω² = g/(L cos(θ))
T_period = 2π√(L cos(θ)/g)
```

### Summary

- Circular motion at constant speed involves centripetal acceleration: a = v²/r
- The centripetal force is provided by real forces (tension, gravity, friction, etc.)
- The velocity is always tangent to the circular path
- The acceleration is always perpendicular to velocity, pointing toward the center',
    20,
    5
  ) RETURNING id INTO lesson_id;

  -- Exercise 2.5.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'A car travels around a curve of radius 50 m at 20 m/s. What is its centripetal acceleration?',
    '["4 m/s²", "8 m/s²", "10 m/s²", "20 m/s²"]'::jsonb,
    '8 m/s²',
    'Use a = v²/r. Calculate 20²/50.',
    'a = v²/r = (20 m/s)² / 50 m = 400/50 = 8 m/s²',
    1
  );

  -- Exercise 2.5.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'fill_blank',
    'In circular motion, the acceleration is always directed ___ the center of the circle.',
    NULL,
    'toward',
    '"Centripetal" means "center-seeking."',
    'Centripetal acceleration always points toward the center of the circular path, perpendicular to the velocity which is tangent to the circle.',
    2
  );

  -- Chapter 2 Test
  INSERT INTO stem_chapter_tests (chapter_id, title, passing_score, time_limit_minutes)
  VALUES (ch2_id, 'Chapter 2 Test: Newton''s Laws', 70, 20)
  RETURNING id INTO test_id;

  INSERT INTO stem_test_questions (test_id, question, question_type, options, correct_answer, explanation, points, order_index)
  VALUES
  (test_id, 'What is the SI unit of force?', 'multiple_choice',
   '["Joule", "Watt", "Newton", "Pascal"]'::jsonb,
   'Newton', 'The Newton (N) is the SI unit of force, defined as 1 N = 1 kg·m/s².', 1, 1),
  (test_id, 'A 10 kg object on a frictionless surface experiences forces of 15 N east and 5 N west. What is its acceleration?', 'numeric',
   NULL, '1', 'Net force = 15 - 5 = 10 N east. a = F/m = 10 N / 10 kg = 1 m/s² east.', 1, 2),
  (test_id, 'For an object in uniform circular motion, the acceleration is:', 'multiple_choice',
   '["Zero", "Constant in magnitude and direction", "Constant in magnitude, changing direction", "Changing in both magnitude and direction"]'::jsonb,
   'Constant in magnitude, changing direction',
   'Centripetal acceleration has constant magnitude v²/r but always points toward the center, so its direction continuously changes.', 1, 3),
  (test_id, 'A block on a frictionless incline at angle θ accelerates at:', 'multiple_choice',
   '["g", "g sin(θ)", "g cos(θ)", "g tan(θ)"]'::jsonb,
   'g sin(θ)', 'Only the component of gravity parallel to the incline (mg sin θ) causes acceleration down the slope.', 1, 4);

  -- ==========================================
  -- CHAPTER 3: Work and Energy
  -- ==========================================
  INSERT INTO stem_chapters (course_id, title, slug, description, order_index)
  VALUES (course_id, 'Work and Energy', 'work-energy',
    'Discover the powerful concepts of work, kinetic energy, potential energy, and the conservation laws that simplify complex mechanics problems.', 3)
  RETURNING id INTO ch3_id;

  -- Lesson 3.1: Work and Kinetic Energy
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch3_id,
    'Work and Kinetic Energy',
    'work-kinetic-energy',
    'reading',
    'Define work as the integral of force over displacement and introduce kinetic energy as the energy of motion.',
    '## Work and Kinetic Energy

Energy methods provide a powerful alternative to force analysis for solving mechanics problems.

### Definition of Work

Work is done when a force causes displacement:
```
W = ∫ F⃗ · dr⃗ = ∫ F cos(θ) dr
```

For a constant force in one dimension:
```
W = FΔx
```

Units of work: Joules (J) = Newton-meters = kg·m²/s²

### Work-Energy Theorem

The net work done on an object equals its change in kinetic energy:
```
W_net = ΔK = Kf - Ki
```

### Kinetic Energy

The energy of motion:
```
K = ½mv²
```

Key insight: Kinetic energy depends on speed **squared**, not velocity direction.

### Derivation of Work-Energy Theorem

Starting from Newton''s Second Law:
```
F = ma = m(dv/dt)

W = ∫ F dx = ∫ m(dv/dt) dx
  = ∫ m v dv
  = ½mv²|_i^f = ½mvf² - ½mvi²
```

### Example: Pulling a Block

A force F pulls a block of mass m across a frictionless surface through distance d, starting from rest:
```
W = Fd = ΔK = ½mv² - 0
v = √(2Fd/m)
```

### Summary

- Work is force integrated over displacement: W = ∫ F·dr
- Kinetic energy is K = ½mv²
- The work-energy theorem: W_net = ΔK
- Work-energy methods often simplify problems compared to direct force analysis',
    15,
    1
  ) RETURNING id INTO lesson_id;

  -- Exercise 3.1.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A 2 kg object moving at 3 m/s has how many Joules of kinetic energy?',
    NULL,
    '9',
    'Use K = ½mv².',
    'K = ½ × 2 kg × (3 m/s)² = 1 × 9 = 9 J',
    1
  );

  -- Exercise 3.1.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A constant 10 N force pushes a 5 kg block 4 meters across a frictionless floor. What is the block''s final speed if it started from rest?',
    NULL,
    '4',
    'Work = Fd = ΔK = ½mv². Solve for v.',
    'W = 10 N × 4 m = 40 J = ½ × 5 × v². v² = 16 → v = 4 m/s',
    2
  );

  -- Lesson 3.2: Potential Energy and Conservative Forces
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch3_id,
    'Potential Energy and Conservative Forces',
    'potential-energy',
    'reading',
    'Introduce potential energy for conservative forces and develop the principle of conservation of mechanical energy.',
    '## Potential Energy and Conservation

For conservative forces, we can define a potential energy function. This leads to one of the most powerful principles in physics: **conservation of mechanical energy**.

### Conservative Forces

A force is conservative if the work done is independent of path.

For conservative forces:
```
W = -ΔU = -(Uf - Ui)
```

### Gravitational Potential Energy

Near Earth''s surface:
```
Ug = mgy
```

### Spring Potential Energy

```
Us = ½k(Δx)²
```

### Conservation of Mechanical Energy

When only conservative forces act:
```
E = K + U = constant
Ki + Ui = Kf + Uf
```

### Force from Potential Energy

```
Fx = -dU/dx
```

### Example: Falling Ball

A ball of mass m falls from height H:
```
Initial: K = 0, U = mgH
Final: K = ½mv², U = 0

mgH = ½mv²
v = √(2gH)
```

### Example: Mass on a Spring

A mass m compresses a spring by distance A and is released:
```
½kA² = ½mv²
v = A√(k/m)
```

### Summary

- Conservative forces have path-independent work
- Potential energy: W = -ΔU
- Mechanical energy E = K + U is conserved for conservative systems
- Energy methods can solve problems without analyzing forces at each point',
    20,
    2
  ) RETURNING id INTO lesson_id;

  -- Exercise 3.2.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'A 1 kg ball is dropped from 5 m. What is its kinetic energy just before hitting the ground? (Use g = 10 m/s²)',
    '["5 J", "10 J", "25 J", "50 J"]'::jsonb,
    '50 J',
    'Use conservation of energy: mgh = K at the bottom.',
    'K = mgh = 1 kg × 10 m/s² × 5 m = 50 J',
    1
  );

  -- Exercise 3.2.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A spring with k = 100 N/m is compressed 0.2 m. How much potential energy is stored?',
    NULL,
    '2',
    'Use Us = ½kx².',
    'Us = ½ × 100 × (0.2)² = 50 × 0.04 = 2 J',
    2
  );

  -- Lesson 3.3: Power
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch3_id,
    'Power',
    'power',
    'reading',
    'Define power as the rate of doing work and explore its applications in mechanical systems.',
    '## Power

Power describes how quickly work is done or energy is transferred.

### Definition of Power

Average power:
```
P_avg = W/Δt
```

Instantaneous power:
```
P = dW/dt = F⃗ · v⃗ = Fv cos(θ)
```

Units: **Watts** (W) = Joules/second

### Power and Velocity

For a force F acting on an object moving at velocity v:
```
P = Fv    (when F and v are parallel)
```

This is why:
- Cars need more power to maintain high speeds (air resistance)
- Lower gears provide more force at lower speeds

### Example: Car Climbing a Hill

A 1000 kg car climbs a 10° hill at constant speed v = 20 m/s against 500 N of air resistance:
```
P = (mg sin(10°) + 500) × 20
  ≈ (1700 + 500) × 20 = 44,000 W = 44 kW
```

### Summary

- Power is the rate of doing work: P = dW/dt
- For constant force parallel to velocity: P = Fv
- Units: Watts (1 W = 1 J/s)
- Power requirements increase with both force needed and speed',
    10,
    3
  ) RETURNING id INTO lesson_id;

  -- Exercise 3.3.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A motor does 1000 J of work in 5 seconds. What is its power output in Watts?',
    NULL,
    '200',
    'Power = Work / Time.',
    'P = 1000 J / 5 s = 200 W',
    1
  );

  -- Chapter 3 Test
  INSERT INTO stem_chapter_tests (chapter_id, title, passing_score, time_limit_minutes)
  VALUES (ch3_id, 'Chapter 3 Test: Work and Energy', 70, 15)
  RETURNING id INTO test_id;

  INSERT INTO stem_test_questions (test_id, question, question_type, options, correct_answer, explanation, points, order_index)
  VALUES
  (test_id, 'Which of the following is a conservative force?', 'multiple_choice',
   '["Friction", "Air resistance", "Gravity", "Drag"]'::jsonb,
   'Gravity',
   'Gravity is conservative because work done depends only on endpoints, not path. Friction, air resistance, and drag are non-conservative (dissipative) forces.', 1, 1),
  (test_id, 'A ball is thrown upward with initial speed 10 m/s. What is its maximum height? (Use g = 10 m/s²)', 'numeric',
   NULL, '5', 'Using energy conservation: ½mv² = mgh → h = v²/(2g) = 100/20 = 5 m.', 1, 2),
  (test_id, 'The work-energy theorem states that net work equals:', 'multiple_choice',
   '["Force times distance", "Change in potential energy", "Change in kinetic energy", "Total mechanical energy"]'::jsonb,
   'Change in kinetic energy',
   'W_net = ΔK = Kf - Ki. This is the fundamental work-energy theorem.', 1, 3);

  -- ==========================================
  -- CHAPTER 4: Momentum and Collisions
  -- ==========================================
  INSERT INTO stem_chapters (course_id, title, slug, description, order_index)
  VALUES (course_id, 'Momentum and Collisions', 'momentum-collisions',
    'Explore the conservation of momentum, impulse, and the analysis of collisions in one and two dimensions.', 4)
  RETURNING id INTO ch4_id;

  -- Lesson 4.1: Momentum and Impulse
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch4_id,
    'Momentum and Impulse',
    'momentum-impulse',
    'reading',
    'Define momentum and impulse, and discover the law of conservation of momentum as a fundamental principle.',
    '## Momentum and Impulse

Momentum provides another powerful framework for analyzing motion, especially useful for collisions and systems of particles.

### Linear Momentum

Definition:
```
p⃗ = mv⃗
```
Units: kg·m/s

Newton''s Second Law in terms of momentum:
```
F⃗ = dp⃗/dt
```

### Impulse

Impulse is the change in momentum:
```
J⃗ = Δp⃗ = p⃗f - p⃗i = ∫ F⃗ dt
```

For a constant force:
```
J⃗ = F⃗Δt
```

### Conservation of Momentum

When the net external force is zero:
```
F⃗_ext = 0  ⇒  p⃗_total = constant
```

This is one of the most fundamental laws in physics — it applies even in situations where energy is not conserved.

### Example: Recoil

A 2 kg gun fires a 0.01 kg bullet at 400 m/s:
```
Initial momentum = 0
2*v_gun + 0.01*400 = 0
v_gun = -2 m/s
```
(Negative indicates opposite direction to the bullet.)

### Summary

- Momentum: p⃗ = mv⃗
- Impulse: J⃗ = Δp⃗ = ∫ F⃗ dt
- Conservation of momentum: When F⃗ext = 0, total momentum is constant
- Momentum is always conserved in collisions; kinetic energy may not be',
    15,
    1
  ) RETURNING id INTO lesson_id;

  -- Exercise 4.1.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A 1000 kg car moving at 20 m/s has what momentum in kg·m/s?',
    NULL,
    '20000',
    'Momentum p = mv.',
    'p = 1000 kg × 20 m/s = 20,000 kg·m/s',
    1
  );

  -- Exercise 4.1.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'A 50 N force acts on an object for 3 seconds. What is the impulse?',
    '["50 N·s", "100 N·s", "150 N·s", "300 N·s"]'::jsonb,
    '150 N·s',
    'Impulse = Force × time for constant force.',
    'J = FΔt = 50 N × 3 s = 150 N·s',
    2
  );

  -- Lesson 4.2: Collisions
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch4_id,
    'Collisions',
    'collisions',
    'reading',
    'Analyze elastic and inelastic collisions, applying conservation of momentum and energy to solve collision problems.',
    '## Collisions

Collisions are interactions where forces act over short times. Understanding collisions is essential for everything from particle physics to car safety design.

### Types of Collisions

| Type | Momentum | Kinetic Energy | Description |
|------|----------|----------------|-------------|
| Elastic | Conserved | Conserved | Objects bounce apart |
| Inelastic | Conserved | Not conserved | Some energy lost |
| Perfectly inelastic | Conserved | Maximum loss | Objects stick together |

### One-Dimensional Elastic Collisions

Both momentum and kinetic energy are conserved:
```
m₁v₁i + m₂v₂i = m₁v₁f + m₂v₂f    (momentum)
½m₁v₁i² + ½m₂v₂i² = ½m₁v₁f² + ½m₂v₂f²    (energy)
```

Useful result (relative velocity):
```
v₁i - v₂i = -(v₁f - v₂f)
```

### Perfectly Inelastic Collisions

Objects stick together:
```
m₁v₁i + m₂v₂i = (m₁ + m₂)vf
```

### Example: Elastic Collision

A 2 kg ball at 3 m/s hits a stationary 1 kg ball elastically:
```
Momentum: 6 = 2v₁f + v₂f
Relative velocity: v₂f = v₁f + 3

Solving: v₁f = 1 m/s, v₂f = 4 m/s
```

### Example: Ballistic Pendulum

A bullet of mass m embeds in a block of mass M. The block rises to height h:
```
Collision: mv = (m + M)V
Rise: V = √(2gh)
Combined: v = (m + M)√(2gh)/m
```

### Summary

- Elastic collisions: Both momentum and kinetic energy conserved
- Inelastic collisions: Only momentum conserved
- Perfectly inelastic: Objects stick together; maximum kinetic energy loss
- Use relative velocity relation for elastic collisions',
    25,
    2
  ) RETURNING id INTO lesson_id;

  -- Exercise 4.2.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'In a perfectly inelastic collision, what happens to the colliding objects?',
    '["They bounce off each other elastically", "They stick together", "They pass through each other", "They exchange velocities"]'::jsonb,
    'They stick together',
    '"Perfectly inelastic" means the maximum possible kinetic energy is lost, which occurs when the objects move together after collision.',
    'In a perfectly inelastic collision, the objects stick together and move with a common final velocity. This results in the maximum loss of kinetic energy while still conserving momentum.',
    1
  );

  -- Exercise 4.2.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A 3 kg object moving at 4 m/s collides with a stationary 1 kg object. If they stick together, what is their final speed?',
    NULL,
    '3',
    'Use conservation of momentum: m₁v₁ = (m₁ + m₂)vf.',
    '3 × 4 = (3 + 1) × vf. 12 = 4vf. vf = 3 m/s',
    2
  );

  -- Chapter 4 Test
  INSERT INTO stem_chapter_tests (chapter_id, title, passing_score, time_limit_minutes)
  VALUES (ch4_id, 'Chapter 4 Test: Momentum and Collisions', 70, 20)
  RETURNING id INTO test_id;

  INSERT INTO stem_test_questions (test_id, question, question_type, options, correct_answer, explanation, points, order_index)
  VALUES
  (test_id, 'Which quantity is ALWAYS conserved in a collision?', 'multiple_choice',
   '["Kinetic energy", "Momentum", "Potential energy", "Total mechanical energy"]'::jsonb,
   'Momentum',
   'Momentum is always conserved in collisions (when no external forces act). Kinetic energy is only conserved in elastic collisions.', 1, 1),
  (test_id, 'In an elastic collision between two objects of equal mass where one is initially at rest, what happens?', 'multiple_choice',
   '["They stick together", "The first stops, the second moves at the first''s initial speed", "They exchange velocities", "Both move at half the initial speed"]'::jsonb,
   'The first stops, the second moves at the first''s initial speed',
   'For equal masses in elastic collisions, the moving object transfers all its momentum and energy to the stationary one.', 1, 2),
  (test_id, 'A 2000 kg truck moving at 10 m/s hits a 1000 kg car at rest. They stick together. What is their final velocity?', 'numeric',
   NULL, '6.67', 'Using momentum conservation: 2000×10 = (2000+1000)v → v = 20000/3000 = 6.67 m/s', 1, 3);

  -- ==========================================
  -- CHAPTER 5: Rotation
  -- ==========================================
  INSERT INTO stem_chapters (course_id, title, slug, description, order_index)
  VALUES (course_id, 'Rotation', 'rotation',
    'Extend Newton''s laws to rotational motion, introducing torque, moment of inertia, and angular momentum.', 5)
  RETURNING id INTO ch5_id;

  -- Lesson 5.1: Torque and Rotational Dynamics
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch5_id,
    'Torque and Rotational Dynamics',
    'torque',
    'reading',
    'Define torque as the rotational analog of force and develop Newton''s Second Law for rotation.',
    '## Torque and Rotational Dynamics

Rotational motion follows laws analogous to linear motion.

### Torque

Torque causes angular acceleration:
```
τ = rF sin(θ) = r⊥F = rF⊥
```

where:
- r is the distance from pivot to force application point
- θ is the angle between r⃗ and F⃗
- r⊥ = r sin(θ) is the "lever arm"

Units: Newton-meters (N·m)

### Moment of Inertia

The rotational analog of mass:
```
I = Σ mᵢrᵢ²
```

For continuous objects:
```
I = ∫ r² dm
```

Common moments of inertia:

| Object | Axis | I |
|--------|------|---|
| Point mass | Distance r | mr² |
| Rod (M, L) | Through center | (1/12)ML² |
| Rod | Through end | (1/3)ML² |
| Disk/cylinder | Through center | (1/2)MR² |
| Solid sphere | Through center | (2/5)MR² |
| Hollow sphere | Through center | (2/3)MR² |

### Newton''s Second Law for Rotation

```
τ_net = Iα
```

where α is angular acceleration.

### Example: Rod Pivoted at End

A uniform rod of mass M and length L is pivoted at one end:
```
Torque: τ = Mg(L/2)
Moment of inertia: I = (1/3)ML²
α = τ/I = 3g/(2L)
```

### Summary

- Torque is the rotational analog of force: τ = rF sin(θ)
- Moment of inertia depends on mass distribution: I = Σmr²
- Newton''s Second Law for rotation: τ = Iα
- Objects with mass farther from the axis have larger moments of inertia',
    20,
    1
  ) RETURNING id INTO lesson_id;

  -- Exercise 5.1.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'A force of 10 N is applied perpendicular to a wrench 0.3 m from the pivot. What is the torque?',
    '["3 N·m", "10 N·m", "13 N·m", "30 N·m"]'::jsonb,
    '3 N·m',
    'For perpendicular force, τ = rF.',
    'τ = rF = 0.3 m × 10 N = 3 N·m',
    1
  );

  -- Exercise 5.1.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'numeric',
    'A solid disk of mass 4 kg and radius 0.5 m has what moment of inertia about its center?',
    NULL,
    '0.5',
    'For a solid disk, I = ½MR².',
    'I = ½ × 4 kg × (0.5 m)² = ½ × 4 × 0.25 = 0.5 kg·m²',
    2
  );

  -- Lesson 5.2: Angular Momentum
  INSERT INTO stem_lessons (chapter_id, title, slug, lesson_type, summary, content, xp_reward, order_index)
  VALUES (
    ch5_id,
    'Angular Momentum',
    'angular-momentum',
    'reading',
    'Introduce angular momentum and the law of conservation of angular momentum with applications.',
    '## Angular Momentum

Angular momentum is the rotational analog of linear momentum. It is conserved in systems with no external torque.

### Definition of Angular Momentum

For a point mass:
```
L = rp = rmv = mr²ω
```

For a rigid body:
```
L = Iω
```

Units: kg·m²/s

### Conservation of Angular Momentum

When net external torque is zero:
```
τ_ext = 0  ⇒  L = constant
Iᵢωᵢ = Ifωf
```

### Example: Spinning Professor

A professor sits on a rotating stool holding weights. When she pulls the weights inward:
- I decreases (mass closer to axis)
- ω increases to conserve L

```
Iiωi = Ifωf
ωf = (Ii/If)ωi > ωi
```

### Example: Satellite Orbit

A satellite in elliptical orbit has:
- Minimum r → maximum ω (fastest at perigee)
- Maximum r → minimum ω (slowest at apogee)

```
r₁²ω₁ = r₂²ω₂
```

### Summary

- Angular momentum: L = Iω for rigid bodies
- Conservation: When τ_ext = 0, angular momentum is constant
- Iω = constant leads to speed changes when I changes
- Explains ice skaters, divers, satellite orbits, and more',
    20,
    2
  ) RETURNING id INTO lesson_id;

  -- Exercise 5.2.1
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'multiple_choice',
    'An ice skater spins with arms extended (I = 5 kg·m²) at 2 rad/s. She pulls her arms in (I = 2 kg·m²). What is her new angular speed?',
    '["0.8 rad/s", "2 rad/s", "5 rad/s", "10 rad/s"]'::jsonb,
    '5 rad/s',
    'Use conservation of angular momentum: I₁ω₁ = I₂ω₂.',
    '5 × 2 = 2 × ω₂ → ω₂ = 10/2 = 5 rad/s',
    1
  );

  -- Exercise 5.2.2
  INSERT INTO stem_exercises (lesson_id, exercise_type, question, options, correct_answer, hint, explanation, order_index)
  VALUES (
    lesson_id,
    'fill_blank',
    'Angular momentum is conserved when the net external ___ is zero.',
    NULL,
    'torque',
    'Just as linear momentum is conserved when net force is zero, angular momentum is conserved when net ___ is zero.',
    'Conservation of angular momentum requires zero net external torque: τ_ext = 0 ⇒ L = constant.',
    2
  );

  -- Chapter 5 Test
  INSERT INTO stem_chapter_tests (chapter_id, title, passing_score, time_limit_minutes)
  VALUES (ch5_id, 'Chapter 5 Test: Rotation', 70, 20)
  RETURNING id INTO test_id;

  INSERT INTO stem_test_questions (test_id, question, question_type, options, correct_answer, explanation, points, order_index)
  VALUES
  (test_id, 'What is the rotational analog of force?', 'multiple_choice',
   '["Mass", "Torque", "Momentum", "Energy"]'::jsonb,
   'Torque', 'Torque is the rotational analog of force, just as moment of inertia is the analog of mass.', 1, 1),
  (test_id, 'A solid cylinder (I = ½MR²) and a hollow cylinder (I = MR²) of the same mass and radius roll down an incline. Which reaches the bottom first?', 'multiple_choice',
   '["They arrive together", "The solid cylinder", "The hollow cylinder", "It depends on the mass"]'::jsonb,
   'The solid cylinder',
   'The solid cylinder has smaller I, so less energy goes into rotation and more into translation — it accelerates faster.', 1, 2),
  (test_id, 'Newton''s Second Law for rotation states that net torque equals:', 'multiple_choice',
   '["Iω", "Iα", "ma", "mv"]'::jsonb,
   'Iα', 'τ = Iα is the rotational analog of F = ma.', 1, 3);

  RAISE NOTICE 'Introductory Physics I course seeded successfully!';
END $seed$;
