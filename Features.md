# Marxist.info — Complete Feature List & Roadmap

> **Internal reference document** — Last updated: 17 March 2026
>
> Tech stack: React 18 · React Router 6 · Supabase (Auth, Database, Storage, Edge Functions, RLS) · TailwindCSS · Recharts / D3 / visx · Framer Motion · Vercel (hosting + analytics) · FastAPI + NVIDIA NIM (MarxBot backend)

---

## Status Legend

| Tag | Meaning |
|-----|---------|
| ✅ | **Built** — live or feature-complete in codebase |
| 🔧 | **Partial** — scaffolded / partially functional, needs more work |
| 🔮 | **Planned** — envisioned but not yet started |

---

## 1. Landing & Authentication

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1.1 | Cinematic landing page (parallax, mouse-tracking reveal, echo effects) | ✅ | Toggle between normal / cinematic view modes |
| 1.2 | Email + password authentication (Supabase Auth) | ✅ | |
| 1.3 | User registration with invite-code gating | ✅ | Invite codes table with usage limits & expiry |
| 1.4 | Waitlist / email sign-up for non-invited users | ✅ | Notify preferences for invites & beta |
| 1.5 | Pending-access page for users without invite | ✅ | `/pending-access` |
| 1.6 | Guest-accessible pages (Home, Digital Library, Forum, Coming Soon) | ✅ | Restricted pages show ✦ marker for guests |
| 1.7 | Maintenance mode (single toggle) | ✅ | `MAINTENANCE_MODE` flag in AppRouter |
| 1.8 | Dev auth bypass for localhost | ✅ | Auto-admin on `localhost` with `marxist_dev_auth` |
| 1.9 | Ko-Fi donation button | ✅ | |
| 1.10 | OAuth providers (Google, GitHub, Discord) | 🔮 | Social login for lower signup friction |
| 1.11 | Two-factor authentication (TOTP) | 🔮 | |
| 1.12 | Onboarding wizard for new members | 🔮 | Guided tour of platform features on first login |

---

## 2. Revolutionary Theory

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 2.1 | Theory article browser with categories & search | ✅ | Dynamic categories from `theory_categories` |
| 2.2 | Article collections (featured, recent, etc.) | ✅ | `/theory/:collectionType` |
| 2.3 | Full article reader with Markdown rendering | ✅ | GFM, HTML, slug headings |
| 2.4 | Table of Contents sidebar | ✅ | Auto-generated from headings |
| 2.5 | Reading progress tracking (scroll %) | ✅ | Persisted per-user to `user_article_progress` |
| 2.6 | Progress milestones (25%, 50%, 75%, Done) | ✅ | |
| 2.7 | Text highlighting (select & save) | ✅ | HighlightHandler + HighlightsSidebar |
| 2.8 | In-article search with mark.js | ✅ | Navigate between matches |
| 2.9 | Bookmarking articles | ✅ | |
| 2.10 | Article comments with threaded replies | ✅ | Quote-selection modal for inline quoting |
| 2.11 | Share / copy link | ✅ | |
| 2.12 | PDF export (jsPDF + html2canvas) | ✅ | |
| 2.13 | Named Entity Recognition (NER) sidebar | ✅ | People, places, organizations extracted from glossary |
| 2.14 | Adaptive Reading Modes (study mode default) | ✅ | Togglable reading mode |
| 2.15 | Semantic Passage Finder | ✅ | Query-based passage ranking using glossary terms |
| 2.16 | Concept Map panel | ✅ | Graph visualization of concept co-occurrence |
| 2.17 | Glossary term popup in articles | ✅ | GlossaryPopup component |
| 2.18 | Community writings section | ✅ | User-submitted texts displayed on Theory page |
| 2.19 | Save community texts to personal collection | ✅ | |
| 2.20 | Reading streaks & gamified tracking | 🔮 | Daily/weekly reading goals |
| 2.21 | Spaced-repetition flashcards from highlights | 🔮 | Auto-generate from user highlights |
| 2.22 | Collaborative annotations | 🔮 | Shared highlights visible to study group |

---

## 3. Deep Analysis (Texts)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3.1 | Analysis text browser with search | ✅ | `TextBrowser` component at `/analysis` |
| 3.2 | Full analysis reader with section-based layout | ✅ | `AnalysisReader` with TOC, metadata panel |
| 3.3 | Multilingual text support (language switcher) | ✅ | Per-section localized content |
| 3.4 | Dual view modes: Reading vs. Analysis | ✅ | URL param `?mode=read` |
| 3.5 | Section-level comments | ✅ | Comment count badges per section |
| 3.6 | Section-level bookmarks | ✅ | |
| 3.7 | Text highlighting with persistence | ✅ | Per-section highlights |
| 3.8 | Real-time presence (see who's reading) | ✅ | `useAnalysisPresence` hook |
| 3.9 | Text selection popup (analyze, highlight, comment) | ✅ | Rich selection actions |
| 3.10 | Text Analysis Panel (keyword extraction, concordance, word frequency) | ✅ | Selection-aware analysis |
| 3.11 | Cross-References Panel (outgoing & incoming) | ✅ | Create/delete cross-text references |
| 3.12 | Reading progress bar | ✅ | |
| 3.13 | Admin upload for analysis texts | ✅ | `/admin/analysis/upload` |
| 3.14 | Comparative text analysis (side-by-side) | 🔮 | Compare two texts or translations |
| 3.15 | AI-powered text summarization per section | 🔮 | |
| 3.16 | Annotation export (Markdown/PDF) | 🔮 | Export all user annotations for a text |

---

## 4. Digital Library

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 4.1 | Book catalog with cover images & categories | ✅ | Grid and list view modes |
| 4.2 | PDF viewer (Supabase storage public URLs) | ✅ | Direct PDF links from `library` bucket |
| 4.3 | Category icons & filtering | ✅ | Political Economy, Philosophy, History, Sociology, Strategy & Tactics |
| 4.4 | Search across books | ✅ | |
| 4.5 | Book reader page | ✅ | `/book/:bookId` |
| 4.6 | Textbook reader page | ✅ | `/science-tech/textbooks/:id` |
| 4.7 | Admin library upload | ✅ | `/admin/library/upload` with PDF + cover upload |
| 4.8 | Official books flag | ✅ | `is_official` column |
| 4.9 | E-Book reader with enhanced display | 🔧 | Planning document exists; reader display in progress |
| 4.10 | EPUB/MOBI support | 🔮 | Beyond PDF-only |
| 4.11 | In-book full-text search | 🔮 | |
| 4.12 | Reading lists / curated collections | 🔮 | User-created or admin-curated book lists |
| 4.13 | Book reviews & ratings | 🔮 | Community reviews |

---

## 5. Politics / Newspaper CMS

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 5.1 | Ornate newspaper-style layout ("Eastern Herald" vibe) | ✅ | Custom CSS, edition-based grouping |
| 5.2 | Edition system (date-based issue codes) | ✅ | `YYYY.MM.DD` issue codes |
| 5.3 | Dispatch categories (Political Analysis, Movements, International, Theory) | ✅ | Category filter bar |
| 5.4 | Placement system (lead, side, bulletin, late edition) | ✅ | Auto-inferred or manually set |
| 5.5 | Full dispatch reader | ✅ | `/politics/:slug` with related dispatches |
| 5.6 | Featured image support with storage | ✅ | `politics_images` bucket |
| 5.7 | Search dispatches | ✅ | |
| 5.8 | CMS upload page (News role + admin) | ✅ | `/admin/politics/upload` via RoleRoute |
| 5.9 | Scheduled / future-published dispatches | ✅ | Visible to editors before publish date |
| 5.10 | Related dispatch ranking (same edition → category → recency) | ✅ | |
| 5.11 | Autosave (local browser) | 🔧 | Decided as local-only; implementation pending |
| 5.12 | RSS feed generation | 🔮 | Auto-generated RSS for dispatches |
| 5.13 | Email newsletter digest | 🔮 | Weekly digest of top dispatches |
| 5.14 | Dispatch comments / discussion | 🔮 | Reader discussion below dispatches |
| 5.15 | Multi-author bylines | 🔮 | Collaborative dispatches |

---

## 6. Study Center

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 6.1 | Study resources (text, video, audio, lecture) with search & nav tabs | ✅ | Supabase-backed `study_resources` |
| 6.2 | Concept analysis cards | ✅ | `study_concepts` with sort order |
| 6.3 | Milestone tracking with progress persistence | ✅ | `study_milestones` + `study_user_progress` |
| 6.4 | AI Study Path (milestone-aware recommendations) | ✅ | Visual step path + completion status |
| 6.5 | AI Study Chat (StudyBot) | ✅ | FastAPI `/api/studybot` endpoint, pedagogical tone |
| 6.6 | Audiobook player with chapter navigation | ✅ | `AudioPlayer.jsx` — play/pause, seek, chapter jump, speed control |
| 6.7 | Dedicated audiobooks page | ✅ | `/audiobooks` with category filter & search |
| 6.8 | Compact sidebar audio player on Study page | ✅ | |
| 6.9 | Digital Library book linking (FK) | ✅ | `digital_library_book_id` on resources |
| 6.10 | Study Admin panel (Teacher + admin) | ✅ | CRUD for resources, concepts, milestones, audiobooks |
| 6.11 | Study groups / reading circles | 🔮 | Group-based milestone tracking & discussion |
| 6.12 | Video lecture hosting (embedded) | 🔮 | Upload or link lecture videos |
| 6.13 | Note-taking integrated with milestones | 🔮 | Personal notes per study resource |
| 6.14 | Certificate of completion for study paths | 🔮 | Verifiable certificates for study milestones |

---

## 7. Knowledge Q&A

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 7.1 | Zhihu-style feed with sidebar + widgets | ✅ | `KnowledgeLayout`, `DenseSidebar`, `FeedStream` |
| 7.2 | Ask questions with topic tagging | ✅ | `/knowledge/ask` |
| 7.3 | Answer questions with voting | ✅ | Upvote/downvote system |
| 7.4 | Question detail page | ✅ | `/knowledge/question/:id` |
| 7.5 | Feed sorting (recent, popular, following) | ✅ | URL-param driven |
| 7.6 | Favorites / bookmarks | ✅ | Favorites view mode |
| 7.7 | Trending questions widget | ✅ | 7-day trending |
| 7.8 | User level system (Newcomer → Icon, 10 tiers) | ✅ | Engagement-based: views + likes×2 + follows×5 |
| 7.9 | Daily Challenge | ✅ | `DailyChallenge` component |
| 7.10 | Quiz Player (standard + weekly quizzes) | ✅ | XP rewards, streak tracking |
| 7.11 | Scenario Player | ✅ | Branching decision scenarios |
| 7.12 | Mastery Tree (concept prerequisites, mastery levels) | ✅ | Locked → Learning → Practiced → Mastered |
| 7.13 | Cell Leaderboard | ✅ | Team/cell-based competition |
| 7.14 | Knowledge moderation panel | ✅ | `/admin/knowledge` for admin review |
| 7.15 | Admin quiz & scenario management | ✅ | `/admin/quizzes`, `/admin/scenarios` |
| 7.16 | Follow topics / users | 🔧 | UI exists; backend partially wired |
| 7.17 | Expert verification badges | 🔮 | Verified answers from subject experts |
| 7.18 | AI-assisted answer drafting | 🔮 | MarxBot suggests answer drafts |
| 7.19 | Knowledge graph visualization | 🔮 | Visual map of all Q&A topics and connections |

---

## 8. Forum

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 8.1 | Board system (7 boards: Theory, Reading, Organizing, History, Current Events, Meta, Random) | ✅ | Chan-style board slugs (`/t/`, `/r/`, etc.) |
| 8.2 | Thread creation with category tagging | ✅ | |
| 8.3 | Threaded comments / replies | ✅ | |
| 8.4 | Like / upvote threads & comments | ✅ | |
| 8.5 | Bookmark threads | ✅ | Bookmarks panel |
| 8.6 | Notifications system | ✅ | NotificationsPanel for replies & mentions |
| 8.7 | Repost / share threads | ✅ | RepostModal with quote-repost |
| 8.8 | Catalog view (image grid) vs. list view | ✅ | Toggle between views |
| 8.9 | Ideology flair tags on posts | ✅ | ML, MLM, Left-Com, Trotskyist, Ancom, etc. |
| 8.10 | Pagination | ✅ | 20 per page default, max 50 |
| 8.11 | Admin thread/comment deletion | ✅ | |
| 8.12 | Anti-spam trigger | ✅ | `block_spam_trigger` migration |
| 8.13 | Guest read access | ✅ | Forum is guest-accessible |
| 8.14 | Image/file attachments in posts | 🔮 | Upload images to threads |
| 8.15 | Markdown formatting in posts | 🔮 | Rich text with preview |
| 8.16 | Thread pinning & locking | 🔮 | Mod tools |
| 8.17 | User reputation system | 🔮 | Forum-specific karma |
| 8.18 | Private messaging (DMs) | 🔮 | Direct messages between members |

---

## 9. Science & Technology

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 9.1 | Subject & course browser | ✅ | Physics, Chemistry, Math, CS, Medicine |
| 9.2 | Course detail page with chapter tree | ✅ | Expandable chapters → lessons |
| 9.3 | Lesson page (video, reading, exercises) | ✅ | Markdown with KaTeX math rendering |
| 9.4 | Interactive exercise widget | ✅ | In-lesson exercises |
| 9.5 | Chapter tests with passing scores | ✅ | `/science-tech/courses/:courseSlug/:chapterSlug/test` |
| 9.6 | XP reward system | ✅ | Per-lesson XP, tracked per user |
| 9.7 | Course enrollment & progress tracking | ✅ | `stem_enrollments`, `stem_lesson_progress` |
| 9.8 | Completion certificates (verifiable) | ✅ | `/verify/:certificateNumber` public verification |
| 9.9 | Textbook browser & reader | ✅ | Separate textbook section |
| 9.10 | Science news feed | ✅ | `NewsFeed` tab |
| 9.11 | STEM admin panel | ✅ | Full CRUD for subjects, courses, chapters, lessons, exercises, tests |
| 9.12 | Difficulty levels (Beginner, Intermediate, Advanced) | ✅ | Per-course tagging |
| 9.13 | Lab simulations (interactive) | 🔮 | Embedded physics/chemistry simulations |
| 9.14 | Peer study rooms | 🔮 | Real-time collaborative problem solving |
| 9.15 | Course recommendations based on progress | 🔮 | AI-driven "next course" suggestions |

---

## 10. Data & Visualizations

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 10.1 | Economic Analysis dashboard | ✅ | Charts powered by Recharts + D3 |
| 10.2 | Class Structure visualization | ✅ | Interactive class-relation diagrams |
| 10.3 | Historical Trends view | ✅ | Long-term social/economic pattern charts |
| 10.4 | Revolutionary Movements map | ✅ | Global mapping (react-simple-maps) |
| 10.5 | Enhanced chart component (bar, line, pie) | ✅ | Configurable chart type selector |
| 10.6 | What-If Analysis tool | ✅ | Scenario-based economic projections |
| 10.7 | Split View (compare two visualizations) | ✅ | Side-by-side comparison mode |
| 10.8 | Dynamic background (sentiment-aware) | ✅ | Animated bg responding to data sentiment |
| 10.9 | Country selector for economic data | ✅ | |
| 10.10 | Wealth inequality charts | ✅ | |
| 10.11 | Global labor market map | ✅ | |
| 10.12 | Multi-metric comparison charts | ✅ | |
| 10.13 | Real-time data feeds (API integrations) | 🔮 | Live economic indicators from World Bank / ILO APIs |
| 10.14 | User-created custom dashboards | 🔮 | Pin & arrange favorite visualizations |
| 10.15 | Data export (CSV, PNG) | 🔮 | |

---

## 11. Research Directory

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 11.1 | Concept Mapping tool | ✅ | `ConceptMapper` — visual concept connections |
| 11.2 | AI-Powered Bibliography generator | ✅ | Topic-based bibliography suggestions |
| 11.3 | Cross-Textual References finder | ✅ | Discover links between different texts |
| 11.4 | Marxist Glossary (self-contained wiki) | ✅ | NO external links — fully self-contained |
| 11.5 | Historical Timeline (interactive) | ✅ | Multi-era: Prehistory, Imperialism, Rupture, Counter-revolution, Postwar |
| 11.6 | Glossary popup integration across platform | ✅ | Term tooltips in article reader |
| 11.7 | Glossary term types (person, place, organization) | ✅ | Powers NER sidebar in reader |
| 11.8 | Research synthesis tool | 🔧 | Scaffolded; needs AI backend |
| 11.9 | Study path generator | 🔧 | Scaffolded component |
| 11.10 | Text analyzer tool | 🔧 | Basic scaffolding exists |
| 11.11 | Collaborative bibliography sharing | 🔮 | Share & merge bibliographies with other users |
| 11.12 | Source verification / fact-checking layer | 🔮 | Community-validated citations |

---

## 12. World Simulation

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 12.1 | Terminal-based UI | ✅ | CRT-style terminal with boot sequence |
| 12.2 | Universe creation (campaigns & difficulty) | ✅ | `create universe --campaign=X --difficulty=N` |
| 12.3 | Entity management (worker cells, couriers, printshops, etc.) | ✅ | Create, destroy, query entities |
| 12.4 | Marx & Engels dialogue system | ✅ | `talk marx`, `talk engels` commands |
| 12.5 | Simulation evolution (fast-forward) | ✅ | `evolve <steps>` command |
| 12.6 | Session save & load | ✅ | Per-user session persistence |
| 12.7 | Campaign system (e.g., Relay to Revolution) | ✅ | Narrative campaigns with story beats |
| 12.8 | Edge Function backend for state/render | ✅ | `world-sim-state`, `world-sim-render` Supabase functions |
| 12.9 | Admin scenario management | ✅ | `/admin/scenarios`, `/admin/world-sim` |
| 12.10 | Graphical map overlay | 🔮 | Visual map showing entity positions |
| 12.11 | Multiplayer cooperative mode | 🔮 | Multiple users in same simulation |
| 12.12 | Historical event triggers | 🔮 | Real historical events inject into simulation |
| 12.13 | Achievement system for simulation milestones | 🔮 | Badges for revolutionary victories |

---

## 13. MarxBot (AI Assistant)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 13.1 | Cinematic coming-soon page | ✅ | Neural network animation, console boot sequence |
| 13.2 | FastAPI backend with RAG engine | ✅ | `marxbot-server/` — 312-text corpus indexed |
| 13.3 | GLM-5 via NVIDIA NIM integration | ✅ | Replaces DeepSeek |
| 13.4 | Bordigist voice persona (MarxBot endpoint) | ✅ | `/api/marxbot` — hardcore Communist Left voice |
| 13.5 | StudyBot pedagogical persona | ✅ | `/api/studybot` — teaching-oriented, softer tone |
| 13.6 | Conversation history (3-turn context) | ✅ | Last 6 messages injected |
| 13.7 | Citation engine (312 source texts) | ✅ | RAG retrieval with source attribution |
| 13.8 | Full in-platform chat UI | 🔮 | Replace coming-soon page with live chat interface |
| 13.9 | Source text preview in responses | 🔮 | Inline expandable source excerpts |
| 13.10 | Voice input/output | 🔮 | Speech-to-text and TTS for MarxBot conversations |
| 13.11 | Context-aware responses (knows what user is reading) | 🔮 | Inject current article/text as additional context |
| 13.12 | Multi-model fallback | 🔮 | Graceful degradation across LLM providers |
| 13.13 | MarxBot debate mode | 🔮 | Argue against user's position using dialectical method |

---

## 14. User Profiles & Social

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 14.1 | Profile editing (username, bio, ideology) | ✅ | |
| 14.2 | Avatar & banner image upload | ✅ | |
| 14.3 | Ideology selector | ✅ | ML, MLM, Left-Com, Trotskyist, Ancom, Orthodox, Council, DemSoc, Unaffiliated |
| 14.4 | Bookmarks & saved quotes collection | ✅ | Displayed on profile page |
| 14.5 | Creator Dashboard (views, likes, follows, growth) | ✅ | Tab-based: Profile, Dashboard, Content, Learning |
| 14.6 | Content tab (user's questions & answers) | ✅ | |
| 14.7 | Learning tab (enrollments, XP, certificates, course progress) | ✅ | |
| 14.8 | Public profile pages | ✅ | `/profile/:username` with forum activity feed |
| 14.9 | Level/rank system (10 tiers) | ✅ | Newcomer → Icon based on engagement |
| 14.10 | Certified member badge | ✅ | `is_certified` flag |
| 14.11 | Private notes | ✅ | `PrivateNotes` component |
| 14.12 | Follow system (user-to-user) | 🔮 | Follow users, see their content in feed |
| 14.13 | Activity feed (what friends are reading/doing) | 🔮 | |
| 14.14 | Achievement showcase on profile | 🔮 | Display earned badges, certificates, streaks |
| 14.15 | Export personal data (GDPR compliance) | 🔮 | |

---

## 15. Admin Panel

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 15.1 | Category & Tag management | ✅ | `/admin/tags` |
| 15.2 | User Role Management (editorial + expertise roles) | ✅ | `/admin/roles` with bulk actions on selected rows |
| 15.3 | Submission review (approve/reject user submissions) | ✅ | `/admin/submissions` |
| 15.4 | Knowledge Q&A moderation | ✅ | `/admin/knowledge` |
| 15.5 | Quiz management (create, edit, delete quizzes) | ✅ | `/admin/quizzes` |
| 15.6 | Scenario management | ✅ | `/admin/scenarios` |
| 15.7 | Analysis text upload | ✅ | `/admin/analysis/upload` |
| 15.8 | Library book upload (PDF + cover) | ✅ | `/admin/library/upload` |
| 15.9 | Politics dispatch upload (CMS) | ✅ | `/admin/politics/upload` — News role access |
| 15.10 | STEM course admin (full CRUD tree) | ✅ | `/admin/stem` — subjects, courses, chapters, lessons, exercises, tests |
| 15.11 | Study Center admin (resources, concepts, milestones, audiobooks) | ✅ | `/admin/study` — Teacher role access |
| 15.12 | World Sim admin | ✅ | `/admin/world-sim` |
| 15.13 | Role audit logging (backend) | ✅ | `profile_role_audit_log` table |
| 15.14 | Audit log viewer UI | 🔮 | Admin panel to browse role change history |
| 15.15 | Analytics dashboard (user growth, engagement metrics) | 🔮 | Beyond Vercel Analytics — internal metrics |
| 15.16 | Content scheduling dashboard | 🔮 | Calendar view of all scheduled content |
| 15.17 | Bulk content import tools | 🔮 | CSV/JSON import for articles, books, etc. |

---

## 16. Role & Permission System

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 16.1 | Admin role (full access) | ✅ | `is_admin` flag + `role='admin'` |
| 16.2 | Editorial roles array on profiles | ✅ | `editorial_roles` column |
| 16.3 | Expertise roles array on profiles | ✅ | `expertise_roles` column (Medicine/Doctor, Chem student, etc.) |
| 16.4 | News role (politics CMS access) | ✅ | |
| 16.5 | Teacher role (study center admin access) | ✅ | |
| 16.6 | RoleRoute guard component | ✅ | Reusable route guard by editorial role |
| 16.7 | AdminRoute guard component | ✅ | Admin-only route guard |
| 16.8 | ProtectedRoute (any authenticated user) | ✅ | |
| 16.9 | Safety, Ideologue, Writer roles | 🔧 | Defined in schema; UI role assignment works; no special permissions wired yet |
| 16.10 | Granular permission matrix | 🔮 | Fine-grained permissions beyond role-based |
| 16.11 | Role request / application system | 🔮 | Users apply for roles; admins approve |

---

## 17. Infrastructure & Platform

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 17.1 | Supabase backend (PostgreSQL + Auth + Storage + Edge Functions) | ✅ | 39 migrations |
| 17.2 | Row-Level Security (RLS) across all tables | ✅ | |
| 17.3 | Vercel hosting with automatic deploys | ✅ | `vercel.json` configured |
| 17.4 | Vercel Analytics | ✅ | `@vercel/analytics` integrated |
| 17.5 | Dark theme (site-wide) | ✅ | ThemeContext; default dark |
| 17.6 | Mobile-responsive layout | ✅ | Mobile menu, responsive grids |
| 17.7 | Error boundaries | ✅ | Global `ErrorBoundary` wrapper |
| 17.8 | 404 Not Found page | ✅ | Catch-all route |
| 17.9 | TailwindCSS styling | ✅ | |
| 17.10 | Supabase Edge Functions (NER, text-analysis, world-sim, study-ai-chat, waitlist) | ✅ | 6 functions deployed |
| 17.11 | Automated test suite | ✅ | Jest + React Testing Library; 21+ tests passing |
| 17.12 | PWA (Progressive Web App) support | 🔮 | Offline access, installable |
| 17.13 | Push notifications (browser + mobile) | 🔮 | New content, replies, mentions |
| 17.14 | Internationalization (i18n) | 🔮 | Full UI translation beyond analysis texts |
| 17.15 | CDN optimization for static assets | 🔮 | |
| 17.16 | Rate limiting & abuse prevention | 🔮 | Beyond current spam trigger |
| 17.17 | Automated backups & disaster recovery | 🔮 | |
| 17.18 | Performance monitoring (Core Web Vitals dashboard) | 🔮 | |

---

<br><br>

---

# ☭ MARXIST.INFO — PUBLIC ROADMAP

> *The revolution will not be scheduled — but it will be shipped.*
>
> This roadmap represents our current development vision for Marxist.info. Features move through discovery, development, and release as they mature. Priorities may shift based on the needs of the movement and feedback from our community. Nothing here is a promise — everything here is a commitment to building the most powerful platform for revolutionary education ever created.

---

## Q2 2026 — "Foundation"

*Hardening the core. Completing the systems already in motion and opening the doors wider.*

---

### 🔴 MarxBot Awakens

The AI theory assistant leaves its cinematic waiting room and enters the platform as a fully interactive conversational presence. Powered by a 312-text Marxist corpus and a RAG citation engine, MarxBot will be able to discuss theory, debate your positions, and cite primary sources inline — all in the unmistakable voice of the Communist Left.

---

### 📖 The New Reader Experience

A completely reimagined e-book and article reading experience. Adaptive reading modes that reshape the interface around how you study. Enhanced typography, smarter navigation, and a reading environment that feels as deliberate as the texts it holds.

---

### 🗞️ The Herald Expands

The Politics newspaper grows into a full editorial operation. Local-browser autosave for editors. Multi-author bylines. Comment threads beneath dispatches. RSS feeds so the dispatches reach beyond the platform. The Eastern Herald becomes a living, breathing publication.

---

### 🔗 Social Fabric

The connective tissue between members deepens. Follow other researchers and theorists. See what your comrades are reading and writing. An activity feed that turns isolated study into collective momentum. The foundations of a real intellectual community.

---

### 🛡️ Role Permissions v2

The Safety, Ideologue, and Writer roles gain real teeth — specialized permissions that let trusted members shape their corners of the platform. Role application workflows so members can request responsibilities. Audit trail visibility for transparency.

---

### 📬 Notifications & Engagement

Never miss a reply, a mention, or a new dispatch. Browser-based push notifications arrive across the platform — forum threads, Knowledge Q&A answers, new Politics editions, and study group updates all surface at the right moment.

---

### 🏷️ Forum Evolution

Rich text and image attachments come to forum posts. Thread pinning and locking give moderators real tools. Markdown preview transforms the writing experience. The forum begins to feel like a place you want to spend time.

---

### 📊 Data Liberation

Export your visualizations. Download charts as PNG. Pull datasets as CSV. The economic analysis and class structure tools stop being view-only and become something you can take with you into the real world.

---

## Q3 2026 — "Intelligence"

*The platform learns. AI-powered features transform passive reading into active understanding.*

---

### 🧠 The Recommendation Engine

A personalized "For You" feed that learns from your reading history, your bookmarks, your highlights. Every member's homepage becomes a unique entry point into the material that matters most to them. The algorithm serves the reader, not the advertiser.

---

### 🔥 Reading Streaks & Gamification

Daily and weekly reading goals. Streak tracking that rewards consistency. A unified XP and achievement system that spans theory articles, STEM courses, Knowledge Q&A, and the Study Center. Leaderboards that celebrate collective effort, not individual vanity.

---

### 🧩 Spaced Repetition & Flashcards

Your highlights and saved passages automatically become study material. A spaced-repetition system that surfaces key concepts at the optimal interval for long-term retention. The platform remembers what you've read — and helps you actually remember it too.

---

### 🤖 Context-Aware MarxBot

MarxBot learns what you're currently reading. Ask a question while studying Capital and it knows exactly which chapter you're in. Request clarification on a passage and it pulls the surrounding context automatically. Theory assistance that meets you where you are.

---

### ✍️ AI-Assisted Knowledge

Draft answers in Knowledge Q&A with AI assistance. MarxBot suggests responses grounded in the corpus, which you can edit, refine, and publish under your name. AI summarization arrives for analysis texts — section-by-section distillation of complex arguments.

---

### 🌐 Knowledge Graph

All questions, topics, concepts, and connections across the Knowledge Q&A rendered as an interactive visual map. See how ideas cluster, where gaps exist, and which intellectual territories remain unexplored. A living cartography of collective understanding.

---

### 📚 Curated Collections & Reading Lists

Admin-curated and user-created reading lists in the Digital Library. Thematic collections that guide new members through essential works. A "syllabus" system that turns the library from a warehouse into a curriculum.

---

### 🔬 Research Synthesis

An AI-powered research tool that can analyze multiple texts simultaneously, identify common themes, trace argumentative threads, and generate synthesis reports. The beginning of computational Marxist scholarship.

---

### 📰 The Newsletter

A weekly email digest of the best Politics dispatches, trending Knowledge questions, and new library additions. The platform reaches into your inbox so you never fall behind.

---

## Q4 2026 — "Community"

*From individual study to collective practice. The tools that turn readers into organizers.*

---

### 📖 Study Circles & Reading Groups

Form study groups around specific texts or topics. Shared milestone tracking. Group discussion threads. Synchronized reading sessions where everyone moves through a text together. The study circle — the oldest form of revolutionary education — goes digital.

---

### 💬 Private Messaging

Direct messages between members. Encrypted, minimal, purposeful. Not a social media feed — a communication tool for coordinating study, sharing resources, and building the relationships that underpin real organizing.

---

### ⚔️ The Debate Arena

Structured online debates with formal rules, time controls, and community voting. Pick a thesis, find an opponent, and argue it out under the discipline of dialectical method. Moderated, recorded, and archived for future study.

---

### 📅 Event Calendar

A coordinated calendar for study group meetings, live lectures, debate sessions, and community events. Timezone-aware. Notification-integrated. The organizational backbone of a distributed collective.

---

### ✏️ Collaborative Annotations

Share your highlights and margin notes with your study group. See what other readers found important in the same text. A layer of collective intelligence that sits on top of every article and book in the platform.

---

### 📝 The Writing Workshop

A collaborative writing environment with peer feedback, revision tracking, and editorial workflows. Draft theory articles, political analyses, or research papers — and refine them with input from comrades before publication.

---

### ⭐ Book Reviews & Community Ratings

Rate and review books in the Digital Library. Community-driven recommendations that surface the most impactful works. A review system built for serious readers, not algorithm-chasing influencers.

---

### 🔍 Comparative Text Analysis

Place two texts side by side. Compare translations. Trace how an argument evolves across editions or authors. A scholarly tool that makes the kind of close reading usually reserved for university seminars accessible to everyone.

---

### 📤 Annotation Export

Export all your highlights, notes, and bookmarks from any text as clean Markdown or formatted PDF. Your intellectual labor belongs to you — take it anywhere.

---

## 2027 H1 — "Expansion"

*Breaking beyond the browser. The platform becomes infrastructure.*

---

### 📱 Mobile Experience

Marxist.info in your pocket. A native mobile application — or an installable Progressive Web App — that brings the full platform to iOS and Android. Offline reading. Push notifications. Study on the train, in the break room, wherever the struggle takes you.

---

### 🌍 Internationalization

The entire platform interface translated into multiple languages. Community-powered translation workflows for content. The revolutionary tradition belongs to the world — the platform should too.

---

### 🔐 Enhanced Authentication

Social login via Google, GitHub, and Discord for frictionless onboarding. Optional two-factor authentication for members who need it. The door gets wider without getting less secure.

---

### 🎓 STEM Lab Simulations

Interactive physics, chemistry, and mathematics simulations embedded directly in Science & Tech courses. Because communists should not only know theory — they should understand the natural world that theory describes.

---

### 🗺️ World Sim: The Map

The World Simulation gains a graphical map overlay. See your worker cells, courier networks, and printshops laid out geographically. Watch the revolution unfold spatially as well as narratively. The terminal remains — the world expands around it.

---

### 🏆 Achievement System

A comprehensive badge and achievement framework that spans every corner of the platform. Earn recognition for reading milestones, quiz mastery, forum contributions, study group participation, and simulation victories. Your profile becomes a record of revolutionary development.

---

### 🎙️ Podcast & Audio Series

Original audio content hosted directly on the platform. Theory lectures, political commentary, historical deep-dives, and interviews — all with the same integrated player that powers the audiobook experience. Subscribe, download, listen offline.

---

### 🤖 MarxBot Debate Mode

Challenge MarxBot to a dialectical debate. Take a position and defend it while the AI argues the counter-thesis using primary sources. A training ground for sharpening your theoretical arguments against an opponent that never gets tired and always cites its sources.

---

### 📊 Admin Analytics Dashboard

A comprehensive internal metrics dashboard that goes beyond page views. User growth trajectories, engagement heatmaps, content performance, study completion rates, and community health indicators. The data to understand how the platform lives and breathes.

---

## 2027 H2 — "Convergence"

*The platform becomes a movement. Features that connect, federate, and scale.*

---

### 📡 Live Events & Webinars

Schedule and stream live lectures, panel discussions, and Q&A sessions directly through the platform. Integrated chat. Recording and archival. The virtual meeting hall for a globally distributed movement.

---

### 🤝 World Sim: Multiplayer

Multiple users inhabit the same simulation. Coordinate strategy, divide labor, and navigate the contradictions of collective revolutionary action in real-time. The World Sim becomes a genuinely social experience.

---

### 📄 Research Paper Pipeline

A formal submission, peer review, and publication system for original research. Community reviewers, editorial boards, and a growing archive of contemporary Marxist scholarship produced entirely within the platform.

---

### 🔗 Federation & Interoperability

Explore connecting Marxist.info with other platforms and organizations through open protocols. The beginning of a federated network where independent instances share content, users, and infrastructure while maintaining autonomy. The platform as commune, not cathedral.

---

### ✍️ Real-Time Document Collaboration

Google Docs-style collaborative editing for theory articles, research papers, and political dispatches. Multiple cursors, live presence indicators, and version history. Writing becomes a collective act.

---

### 📶 Offline Library Sync

Download entire reading lists, books, and articles for offline access. Study on planes, in areas without connectivity, or simply free from the distraction of being online. Your library travels with you.

---

### 🧬 Public API

A documented, rate-limited API for third-party integrations. Embed platform content on external sites. Build custom tools on top of the Marxist.info data layer. The platform becomes infrastructure that others can build upon.

---

### 🗳️ Expert Verification & Trust

Verified expert badges for subject-matter authorities. Community-validated citations and fact-checking layers. A trust system that elevates quality without creating hierarchy. Expertise recognized, not credentialed.

---

## The Horizon — "Beyond"

*Long-term vision. The features we dream about.*

---

### 🌐 The Marxist Metaplatform

A network of interconnected Marxist.info instances run by organizations worldwide, sharing a common protocol but maintaining local autonomy. Each node contributes to and draws from a collective knowledge base. Not one platform — a movement of platforms.

---

### 🎮 World Sim: The Living History

Historical events that unfold in real-time within simulations. An ever-expanding campaign library contributed by the community. Achievements that unlock hidden historical scenarios. The simulation becomes an endless, evolving game of revolutionary strategy.

---

### 🧠 The Dialectical Engine

An AI system that doesn't just answer questions — it thinks dialectically. Identifies contradictions in arguments. Traces the historical development of ideas. Suggests syntheses. The ultimate tool for the serious student of Marxist philosophy.

---

### 📻 Revolutionary Radio

A 24/7 streaming channel of curated audio content — audiobook chapters, podcast episodes, lecture recordings, and theory readings — that plays continuously like a radio station. Tune in and let the theory wash over you.

---

### 🏫 The Virtual Institute

A complete online institute for Marxist education with formal enrollment, structured semesters, graded assessments, peer cohorts, and certificates of completion recognized by affiliated organizations. The party school goes digital.

---

### 📊 Real-Time Global Dashboard

Live data feeds from World Bank, ILO, and other sources powering real-time economic dashboards. Watch inequality metrics, labor statistics, and crisis indicators update before your eyes. The material conditions, visualized as they unfold.

---

### 🛡️ Organizational Toolkit

Secure channels, task assignment, meeting scheduling, and operational planning tools purpose-built for political organizations. Not Slack, not Discord — a tool designed from the ground up for the specific needs of revolutionary organizing.

---

### 📕 The Autonomous Press

A full publishing pipeline — from draft to typeset to print-ready PDF. Members author, edit, design, and publish physical pamphlets, zines, and books entirely through the platform. The digital and the physical converge.

---

<br>

---

> **A note on development:** Marxist.info is built using AI-accelerated development (vibecoding with AI IDE tools), enabling feature velocity far beyond traditional solo development. Full features — frontend, backend, database migrations, and tests — ship in hours, not weeks. This roadmap is ambitious by design. Priorities shift based on community feedback and the needs of the movement. Nothing here is a promise. Everything here is the direction we're building toward.
>
> *Workers of the world, update.*
