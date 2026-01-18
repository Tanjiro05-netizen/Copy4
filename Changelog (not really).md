# Changelog (not really) & Development Plan

## 1. Re-introduce password protection (Passwortschutz wiedereinfügen)
**Current Status:**
- `AuthContext.jsx` handles authentication via Supabase.
- A development bypass exists for `localhost` (`admin@localhost`).
- `AppRouter.jsx` protects most routes using `ProtectedRoute`.
- **Note:** It's unclear if this refers to removing the dev bypass, adding a global site password, or fixing a specific login issue.

**To Do:**
- [ ] Review `AuthContext.jsx` and decide on removing the `marxist_dev_auth` bypass for production.
- [ ] Ensure `ProtectedRoute` is correctly applied to all sensitive routes.
- [ ] (Optional) Implement a simple global password if that's what is meant by "Passwortschutz" for a staging environment.

## 2. Study AI companion
**Current Status:**
- `GUIDEAI.md` outlines a comprehensive plan (Text Analysis, Research Synthesis, Study Path).
- `StudyPathAI.jsx` exists as a UI prototype with dummy responses ("Hello! I am your AI Study Assistant...").
- No real backend integration with OpenAI/LLMs yet.

**To Do:**
- [ ] **Backend:** Create a Supabase Edge Function or backend service to call OpenAI API.
- [ ] **Frontend:** Connect `StudyPathAI.jsx` to the backend.
- [ ] **Context:** Implement RAG (Retrieval-Augmented Generation) using the text content from `ArticleReaderPage` and `BookReaderPage` to let the AI answer questions about the specific texts.

## 3. Video Gallery
**Current Status:**
- `StudyResources.jsx` contains dummy data for Videos.
- `ScienceTechPage.jsx` has layout placeholders for video content (aspect-video).
- No dedicated "Video Gallery" page exists in `AppRouter.jsx`.

**To Do:**
- [ ] Create a dedicated `VideoGalleryPage.jsx` or a section in `DigitalLibraryPage`.
- [ ] Create a `videos` table in Supabase or extend `study_resources` to support video URLs (YouTube/Vimeo/Self-hosted).
- [ ] Implement a video player component.

## 4. Science Page
**Current Status:**
- `ScienceTechPage.jsx` is well-implemented.
- Fetches data from `sci_tech_categories`, `sci_tech_articles`, `sci_tech_projects`.
- Includes sections for "National Science Awards", "News", "Museums", and "Digital Age".

**To Do:**
- [ ] Verify data population in Supabase (categories, articles, projects).
- [ ] Ensure responsive design is fully polished.
- [ ] Add ability to click through to full articles (`/sci-tech/:id`).

## 5. Access for Amadeobolshevik
**Current Status:**
- Authentication is handled by Supabase Auth.
- No specific hardcoded access for "Amadeobolshevik" exists (only `dev-admin` in `AuthContext` for localhost).

**To Do:**
- [ ] Create a user account for "Amadeobolshevik" in Supabase Auth.
- [ ] Assign appropriate roles (Admin/Editor) in a `profiles` or `user_roles` table if RBAC is implemented.
- [ ] (Alternative) Hardcode a specific access bypass if strictly necessary (not recommended for production).

## 6. PDF and TEXT-Reader Feature for the Theory Page
**Current Status:**
- **Text Reader:** `ArticleReaderPage.jsx` exists. Features: Markdown rendering, NER (Named Entity Recognition) stub, highlighting, TTS (via browser API?), simple search.
- **PDF Reader:** `BookReaderPage.jsx` exists. Uses an `iframe` to display PDFs from Supabase Storage.
- **Theory Page:** `TheoryPage.jsx` links to collections.

**To Do:**
- [ ] **PDF Reader:** Improve `BookReaderPage` (e.g., use `react-pdf` for better control instead of iframe, add annotation capabilities).
- [ ] **Integration:** Ensure `TheoryPage` correctly links to these readers based on content type (PDF vs. Text/Markdown).
- [ ] **Enhancements:**
    - [ ] Add "Read Aloud" (TTS) to `ArticleReaderPage`.
    - [ ] implementing "Save Progress" for PDFs (might require `react-pdf`).
