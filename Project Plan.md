# Project Plan & Migration Summary

This document provides a comprehensive overview of the Marxist-Platform project, detailing its evolution from a static prototype to a dynamic, data-driven application powered by Supabase. It covers the work completed, the current architecture, and the plan for future enhancements.

## I. Project Overview: From Static Prototype to Dynamic Application

The primary objective of this project was to migrate a static React prototype into a fully functional, scalable, and easily maintainable web application. The original prototype relied on hardcoded data and local JSON files, which limited content management and interactivity.

By integrating Supabase, a powerful open-source Firebase alternative, we have transformed the core pages into dynamic components that fetch data directly from a Postgres database. This new architecture provides:

- **Centralized Content Management:** All content is stored in Supabase tables, allowing for easy updates without changing the frontend code.
- **Scalability:** The application can now handle a growing amount of data and users efficiently.
- **Enhanced Performance:** By offloading filtering and searching to the backend, we reduce the load on the client's browser and improve response times.
- **Improved User Experience:** Dynamic content, loading states, and error handling create a more professional and responsive user interface.

## II. Completed Migrations

The following sections detail the migration process for each of the core pages.

### 1. Analysis Page (`AnalysisPage.jsx`)

*   **Initial State:** The page loaded static article data from local `.json` files. All filtering and sorting logic was handled on the client-side, which was inefficient for larger datasets.
*   **New Architecture & Functionality:**
    *   **Backend Schema:** A new `analyses` table was created in Supabase to store articles and their metadata.
        ```sql
        CREATE TABLE analyses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          author TEXT,
          date DATE,
          tags TEXT[], -- Array of tags for filtering
          content TEXT, -- Full article content
          created_at TIMESTAMPTZ DEFAULT now()
        );
        ```
    *   **Data Migration:** The content from the original `.json` files was successfully migrated into the `analyses` table.
    *   **Frontend Refactor:** `AnalysisPage.jsx` was completely refactored to:
        - Fetch all article data directly from Supabase on component mount.
        - Implement loading and error states to provide feedback to the user.
        - Connect the UI controls (search bar, sort options) to perform dynamic Supabase queries. This moves the filtering logic to the backend, ensuring high performance.

*   **Example Supabase Query (Fetching & Filtering):**
    ```javascript
    // Fetch articles with search and sorting
    async function fetchAnalyses(searchTerm, sortBy) {
      let query = supabase.from('analyses').select('*');

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (sortBy === 'date_asc') {
        query = query.order('date', { ascending: true });
      } else {
        query = query.order('date', { ascending: false });
      }

      const { data, error } = await query;
      return { data, error };
    }
    ```

### 2. Digital Library (`DigitalLibraryPage.jsx`)

*   **Initial State:** The page had a functional UI but relied on placeholder data and filters. The backend schema was incomplete and did not support the required filtering capabilities.
*   **New Architecture & Functionality:**
    *   **Backend Schema Enhancement:** The existing `digital_library_books` table was enhanced by adding `category`, `era`, and `language` columns to enable rich, multi-faceted filtering.
        ```sql
        -- Migration applied to the existing table
        ALTER TABLE digital_library_books
        ADD COLUMN category TEXT,
        ADD COLUMN era TEXT,
        ADD COLUMN language TEXT;
        ```
    *   **Data Migration:** Existing book records were updated with appropriate values for the new columns.
    *   **Frontend Refactor:** `DigitalLibraryPage.jsx` was updated to:
        - Fetch all book data from Supabase.
        - Connect the category, era, and language filters to the backend. Selections now dynamically construct a Supabase query to fetch only the relevant books.
        - All client-side filtering was removed in favor of more efficient server-side querying.

*   **Example Supabase Query (Multi-Filter):**
    ```javascript
    // Fetch books with multiple filters
    async function fetchBooks(filters) {
      let query = supabase.from('digital_library_books').select('*');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.era) {
        query = query.eq('era', filters.era);
      }
      if (filters.language) {
        query = query.eq('language', filters.language);
      }
      if (filters.searchTerm) {
        query = query.ilike('title', `%${filters.searchTerm}%`);
      }

      const { data, error } = await query;
      return { data, error };
    }
    ```

### 3. Science & Tech Page (`ScienceTechPage.jsx`)

*   **Initial State:** This was a completely static page with all content (categories, articles, projects) hardcoded into JavaScript arrays within the component file.
*   **New Architecture & Functionality:**
    *   **Backend Schema Design:** Three new tables were designed and created to model the page's content structure.
        ```sql
        -- Stores filter categories and their icons
        CREATE TABLE sci_tech_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          icon_name TEXT -- e.g., 'Atom', 'Cpu', 'FlaskConical'
        );

        -- Stores news articles, linked to a category
        CREATE TABLE sci_tech_articles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          source TEXT,
          url TEXT,
          category_id UUID REFERENCES sci_tech_categories(id)
        );

        -- Stores tech projects/museums, linked to a category
        CREATE TABLE sci_tech_projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          category_id UUID REFERENCES sci_tech_categories(id)
        );
        ```
    *   **Data Migration:** All static content was migrated from the frontend component into these new Supabase tables.
    *   **Frontend Refactor:** `ScienceTechPage.jsx` was rewritten to be fully dynamic:
        - It now fetches categories, articles, and projects from Supabase in parallel.
        - The category filter and search bar are connected to backend queries.
        - A mapping was created to dynamically render `lucide-react` icons based on the `icon_name` fetched from the database, making the UI easily extensible.

### 4. Revolutionary Theory Page (`TheoryPage.jsx`)

*   **Initial State:** The page was partially dynamic but contained bugs, inefficient data fetching, and hardcoded "Collections" sections. It lacked a comments feature and search functionality.
*   **New Architecture & Functionality:**
    *   **Backend Schema:** A comprehensive schema was designed and implemented to support dynamic categories, articles, user profiles, and a threaded comments section. This included the `theory_categories`, `theory_articles`, `profiles`, and `theory_article_comments` tables.
    *   **Data Migration:** User-specified categories and the "Communist Manifesto" article were migrated into the new tables.
    *   **Frontend Refactor:** `TheoryPage.jsx` was completely refactored to be fully dynamic, fetching all data from Supabase, with efficient loading states and real-time filtering.
    *   **New Features:**
        - **Comments Section:** A fully functional, secure, and threaded comments section was added.
        - **Search:** A search bar was implemented to allow users to easily find articles.
*   **Security Enhancements:**
    *   Row-Level Security (RLS) was enabled on all public tables to prevent unauthorized data access.
    *   Database functions were patched to fix security vulnerabilities.

## III. Future Work & Enhancements

This section outlines the plan for developing new features and pages, building upon the dynamic infrastructure now in place.

### 1. Revolutionary Theory Page: Implementation Plan

This document outlines the necessary steps to transform the static "Revolutionary Theory" page into a dynamic, data-driven section of the application. The goal is to replace all dummy data with real content fetched from a Supabase backend.

#### a. Data Schema (Supabase SQL)

We need to create tables to store the theoretical content, categories, and user-specific data like progress.

**`theory_categories` Table**

Stores the different categories of theory (e.g., Economics, Social Theory).

```sql
CREATE TABLE theory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sample Data
INSERT INTO theory_categories (name) VALUES
('Economics'),
('Theoretical Analysis'),
('Article'),
('Critique'),
('Political Economy and Social Theory'),
('For Philosophical and Epistemological Inquiry'),
('Historical Analysis'),
('Natural and Formal Sciences');
```

**`theory_articles` Table**

Stores the actual articles, essays, and other theoretical materials.

```sql
CREATE TABLE theory_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- For clean URLs
  content TEXT NOT NULL, -- The main body of the article (Markdown or HTML)
  excerpt TEXT, -- A short summary
  category_id UUID REFERENCES theory_categories(id),
  collection TEXT, -- e.g., 'classic', 'contemporary'
  is_featured BOOLEAN DEFAULT FALSE, -- To mark articles for the 'Featured Materials' section
  estimated_time_min INT, -- Estimated reading time in minutes
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**`user_article_progress` Table**

Tracks the reading progress of each user for each article.

```sql
CREATE TABLE user_article_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  article_id UUID REFERENCES theory_articles(id) NOT NULL,
  progress_percentage INT NOT NULL DEFAULT 0, -- Progress from 0 to 100
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id) -- Ensures one progress entry per user per article
);
```

#### b. Core Functionalities to Implement

- **Fetch Categories**: Create a function to fetch all categories from the `theory_categories` table and display them in the left-hand sidebar.
- **Filter by Category**: Clicking a category should filter the list of articles displayed on the page.
- **Fetch Featured Materials**: The "Featured Materials" section should dynamically display articles where `is_featured` is `TRUE`.
- **Fetch Collections**: The "Marxist Classics" and "Contemporary Theory" sections should fetch articles based on the `collection` column.
- **Article Detail View**: Clicking an article should navigate to a dedicated page to display its full `content`.
- **User Progress Tracking**:
  - When a user is reading an article, periodically update their progress in the `user_article_progress` table.
  - Fetch and display this progress on the main theory page (e.g., the progress bar under featured materials).
- **Search Functionality**: Implement a search bar to filter articles by title or content.

#### c. API Integration (Supabase Client)

Here are examples of the queries you'll need to run from your React application using `supabase-js`.

```javascript
import { supabase } from './supabaseClient';

// Fetch all categories
async function getCategories() {
  const { data, error } = await supabase.from('theory_categories').select('*');
  return { data, error };
}

// Fetch featured articles with their category name
async function getFeaturedArticles() {
  const { data, error } = await supabase
    .from('theory_articles')
    .select(`
      title, slug, excerpt, estimated_time_min,
      category: theory_categories (name)
    `)
    .eq('is_featured', true)
    .limit(2);
  return { data, error };
}

// Fetch articles by collection
async function getArticlesByCollection(collectionName) {
  const { data, error } = await supabase
    .from('theory_articles')
    .select('*')
    .eq('collection', collectionName);
  return { data, error };
}

// Get user progress for a specific article
async function getArticleProgress(userId, articleId) {
    const { data, error } = await supabase
        .from('user_article_progress')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('article_id', articleId)
        .single();
    return data ? data.progress_percentage : 0;
}

// Update user progress
async function updateArticleProgress(userId, articleId, progress) {
    const { data, error } = await supabase
        .from('user_article_progress')
        .upsert({
            user_id: userId,
            article_id: articleId,
            progress_percentage: progress,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, article_id' });
    return { data, error };
}
```

### 2. Future Enhancements

With the core pages migrated and the comments feature implemented, the platform is now ready for the next phase of development. The following is a high-level list of potential features to consider:

- **User Profiles:** A dedicated page for users to view their activity, saved articles, and manage their settings.
- **Content Submission:** A system for users to submit their own articles for review and publication.
- **Advanced Search:** Enhancing the search functionality with more powerful filters and full-text search capabilities.
- **Notifications:** A system to notify users about new comments on their posts or articles they follow.


