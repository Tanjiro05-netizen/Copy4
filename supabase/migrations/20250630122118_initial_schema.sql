

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id_to_check" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
        BEGIN
            RETURN EXISTS (
                SELECT 1
                FROM profiles
                WHERE id = user_id_to_check AND role = 'admin'
            );
        END;
        $$;


ALTER FUNCTION "public"."is_admin"("user_id_to_check" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "category" "text",
    "excerpt" "text",
    "article_date" "date",
    "citations" integer,
    "methodology" "text",
    "peer_reviewed" boolean,
    "keywords" "text"[],
    "references" integer,
    "comments" integer,
    "read_time_minutes" integer,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analyses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."article_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "abstract" "text" NOT NULL,
    "keywords" "text"[],
    "file_path" "text" NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category_id" "uuid",
    "tag_ids" "uuid"[]
);


ALTER TABLE "public"."article_submissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."article_submissions" IS 'Stores user-submitted articles for review.';



COMMENT ON COLUMN "public"."article_submissions"."status" IS 'The current review status of the submission.';



CREATE TABLE IF NOT EXISTS "public"."digital_library_books" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "author" "text",
    "year" integer,
    "description" "text",
    "cover_image_url" "text",
    "pdf_filename" "text" NOT NULL,
    "pages" integer,
    "downloads" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category" "text",
    "era" "text",
    "language" "text"
);


ALTER TABLE "public"."digital_library_books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "avatar_url" "text",
    "website" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bio" "text",
    "ideology" "text",
    "banner_url" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "is_certified" boolean DEFAULT false,
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sci_tech_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "excerpt" "text",
    "category_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sci_tech_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sci_tech_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "icon_name" "text"
);


ALTER TABLE "public"."sci_tech_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sci_tech_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sci_tech_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theory_article_analysis_notes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "article_id" "uuid",
    "content" "text" NOT NULL
);


ALTER TABLE "public"."theory_article_analysis_notes" OWNER TO "postgres";


ALTER TABLE "public"."theory_article_analysis_notes" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."theory_article_analysis_notes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."theory_article_citations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "citing_article_id" "uuid" NOT NULL,
    "cited_article_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."theory_article_citations" OWNER TO "postgres";


COMMENT ON TABLE "public"."theory_article_citations" IS 'Tracks citations between articles.';



COMMENT ON COLUMN "public"."theory_article_citations"."citing_article_id" IS 'The article that contains the citation.';



COMMENT ON COLUMN "public"."theory_article_citations"."cited_article_id" IS 'The article that is being cited.';



CREATE TABLE IF NOT EXISTS "public"."theory_article_comments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL,
    "article_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_comment_id" bigint,
    CONSTRAINT "theory_article_comments_content_check" CHECK (("char_length"("content") > 0))
);


ALTER TABLE "public"."theory_article_comments" OWNER TO "postgres";


ALTER TABLE "public"."theory_article_comments" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."theory_article_comments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."theory_article_tags" (
    "article_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."theory_article_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theory_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "excerpt" "text",
    "category_id" "uuid",
    "is_featured" boolean DEFAULT false,
    "is_classic" boolean DEFAULT false,
    "is_contemporary" boolean DEFAULT false,
    "estimated_time_min" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "collection" "text",
    "description" "text"
);


ALTER TABLE "public"."theory_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theory_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."theory_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theory_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."theory_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_article_bookmarks" (
    "user_id" "uuid" NOT NULL,
    "article_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_article_bookmarks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_article_highlights" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "article_id" "uuid" NOT NULL,
    "selected_text" "text" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "serialized_range" "text"
);


ALTER TABLE "public"."user_article_highlights" OWNER TO "postgres";


ALTER TABLE "public"."user_article_highlights" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_article_highlights_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_article_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "article_id" "uuid",
    "progress_percentage" integer,
    "last_read_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_article_progress_progress_percentage_check" CHECK ((("progress_percentage" >= 0) AND ("progress_percentage" <= 100)))
);


ALTER TABLE "public"."user_article_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "article_id" "uuid" NOT NULL,
    "quote_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_quotes" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_quotes" IS 'Stores text quotes saved by users from articles.';



ALTER TABLE ONLY "public"."analyses"
    ADD CONSTRAINT "analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."article_submissions"
    ADD CONSTRAINT "article_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."digital_library_books"
    ADD CONSTRAINT "digital_library_books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."sci_tech_articles"
    ADD CONSTRAINT "sci_tech_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sci_tech_categories"
    ADD CONSTRAINT "sci_tech_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."sci_tech_categories"
    ADD CONSTRAINT "sci_tech_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sci_tech_projects"
    ADD CONSTRAINT "sci_tech_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_article_analysis_notes"
    ADD CONSTRAINT "theory_article_analysis_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_article_citations"
    ADD CONSTRAINT "theory_article_citations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_article_comments"
    ADD CONSTRAINT "theory_article_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_article_tags"
    ADD CONSTRAINT "theory_article_tags_pkey" PRIMARY KEY ("article_id", "tag_id");



ALTER TABLE ONLY "public"."theory_articles"
    ADD CONSTRAINT "theory_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_articles"
    ADD CONSTRAINT "theory_articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."theory_categories"
    ADD CONSTRAINT "theory_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_tags"
    ADD CONSTRAINT "theory_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."theory_tags"
    ADD CONSTRAINT "theory_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_article_analysis_notes"
    ADD CONSTRAINT "unique_user_article_note" UNIQUE ("user_id", "article_id");



ALTER TABLE ONLY "public"."user_article_bookmarks"
    ADD CONSTRAINT "user_article_bookmarks_pkey" PRIMARY KEY ("user_id", "article_id");



ALTER TABLE ONLY "public"."user_article_highlights"
    ADD CONSTRAINT "user_article_highlights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_article_progress"
    ADD CONSTRAINT "user_article_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_article_progress"
    ADD CONSTRAINT "user_article_progress_user_id_article_id_key" UNIQUE ("user_id", "article_id");



ALTER TABLE ONLY "public"."user_quotes"
    ADD CONSTRAINT "user_quotes_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "on_submission_update" BEFORE UPDATE ON "public"."article_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."article_submissions"
    ADD CONSTRAINT "article_submissions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."theory_categories"("id");



ALTER TABLE ONLY "public"."article_submissions"
    ADD CONSTRAINT "article_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."article_submissions"
    ADD CONSTRAINT "fk_article_submissions_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sci_tech_articles"
    ADD CONSTRAINT "sci_tech_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."sci_tech_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."theory_article_analysis_notes"
    ADD CONSTRAINT "theory_article_analysis_notes_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_article_analysis_notes"
    ADD CONSTRAINT "theory_article_analysis_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_article_citations"
    ADD CONSTRAINT "theory_article_citations_cited_article_id_fkey" FOREIGN KEY ("cited_article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_article_citations"
    ADD CONSTRAINT "theory_article_citations_citing_article_id_fkey" FOREIGN KEY ("citing_article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_article_comments"
    ADD CONSTRAINT "theory_article_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_article_comments"
    ADD CONSTRAINT "theory_article_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."theory_article_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_article_comments"
    ADD CONSTRAINT "theory_article_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_article_tags"
    ADD CONSTRAINT "theory_article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_article_tags"
    ADD CONSTRAINT "theory_article_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."theory_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_articles"
    ADD CONSTRAINT "theory_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."theory_categories"("id");



ALTER TABLE ONLY "public"."user_article_bookmarks"
    ADD CONSTRAINT "user_article_bookmarks_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_article_bookmarks"
    ADD CONSTRAINT "user_article_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_article_highlights"
    ADD CONSTRAINT "user_article_highlights_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_article_highlights"
    ADD CONSTRAINT "user_article_highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_article_progress"
    ADD CONSTRAINT "user_article_progress_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_article_progress"
    ADD CONSTRAINT "user_article_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_quotes"
    ADD CONSTRAINT "user_quotes_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."theory_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_quotes"
    ADD CONSTRAINT "user_quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage article-tag links" ON "public"."theory_article_tags" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage tags" ON "public"."theory_tags" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update any profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Allow admin full access" ON "public"."theory_article_analysis_notes" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Allow admins to delete citations" ON "public"."theory_article_citations" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Allow anyone to view comments" ON "public"."theory_article_comments" FOR SELECT USING (true);



CREATE POLICY "Allow authenticated users to create citations" ON "public"."theory_article_citations" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert comments" ON "public"."theory_article_comments" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow individual insert access on user_article_progress" ON "public"."user_article_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow individual read access on user_article_progress" ON "public"."user_article_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow individual update access on user_article_progress" ON "public"."user_article_progress" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow public read access" ON "public"."analyses" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."sci_tech_articles" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."sci_tech_categories" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."sci_tech_projects" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on theory_articles" ON "public"."theory_articles" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on theory_categories" ON "public"."theory_categories" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to all articles" ON "public"."theory_articles" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to citations" ON "public"."theory_article_citations" FOR SELECT USING (true);



CREATE POLICY "Allow users to manage their own highlights" ON "public"."user_article_highlights" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own comments" ON "public"."theory_article_comments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Article-tag links are publicly viewable" ON "public"."theory_article_tags" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Authenticated users can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable delete for comment authors and admin users" ON "public"."theory_article_comments" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Enable read access for all users" ON "public"."digital_library_books" FOR SELECT USING (true);



CREATE POLICY "Public can view all books" ON "public"."digital_library_books" FOR SELECT USING (true);



CREATE POLICY "Tags are publicly viewable" ON "public"."theory_tags" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can create their own notes" ON "public"."theory_article_analysis_notes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own bookmarks" ON "public"."user_article_bookmarks" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own notes" ON "public"."theory_article_analysis_notes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own quotes" ON "public"."user_quotes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own bookmarks" ON "public"."user_article_bookmarks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own quotes" ON "public"."user_quotes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own submissions" ON "public"."article_submissions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notes" ON "public"."theory_article_analysis_notes" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own quotes" ON "public"."user_quotes" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own bookmarks" ON "public"."user_article_bookmarks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notes" ON "public"."theory_article_analysis_notes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own quotes" ON "public"."user_quotes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own submissions" ON "public"."article_submissions" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."article_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."digital_library_books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sci_tech_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sci_tech_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sci_tech_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theory_article_analysis_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theory_article_citations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theory_article_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theory_article_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theory_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theory_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theory_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_article_bookmarks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_article_highlights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_article_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_quotes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id_to_check" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id_to_check" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id_to_check" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."analyses" TO "anon";
GRANT ALL ON TABLE "public"."analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."analyses" TO "service_role";



GRANT ALL ON TABLE "public"."article_submissions" TO "anon";
GRANT ALL ON TABLE "public"."article_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."article_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."digital_library_books" TO "anon";
GRANT ALL ON TABLE "public"."digital_library_books" TO "authenticated";
GRANT ALL ON TABLE "public"."digital_library_books" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."sci_tech_articles" TO "anon";
GRANT ALL ON TABLE "public"."sci_tech_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."sci_tech_articles" TO "service_role";



GRANT ALL ON TABLE "public"."sci_tech_categories" TO "anon";
GRANT ALL ON TABLE "public"."sci_tech_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."sci_tech_categories" TO "service_role";



GRANT ALL ON TABLE "public"."sci_tech_projects" TO "anon";
GRANT ALL ON TABLE "public"."sci_tech_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."sci_tech_projects" TO "service_role";



GRANT ALL ON TABLE "public"."theory_article_analysis_notes" TO "anon";
GRANT ALL ON TABLE "public"."theory_article_analysis_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_article_analysis_notes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."theory_article_analysis_notes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."theory_article_analysis_notes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."theory_article_analysis_notes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."theory_article_citations" TO "anon";
GRANT ALL ON TABLE "public"."theory_article_citations" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_article_citations" TO "service_role";



GRANT ALL ON TABLE "public"."theory_article_comments" TO "anon";
GRANT ALL ON TABLE "public"."theory_article_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_article_comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."theory_article_comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."theory_article_comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."theory_article_comments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."theory_article_tags" TO "anon";
GRANT ALL ON TABLE "public"."theory_article_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_article_tags" TO "service_role";



GRANT ALL ON TABLE "public"."theory_articles" TO "anon";
GRANT ALL ON TABLE "public"."theory_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_articles" TO "service_role";



GRANT ALL ON TABLE "public"."theory_categories" TO "anon";
GRANT ALL ON TABLE "public"."theory_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_categories" TO "service_role";



GRANT ALL ON TABLE "public"."theory_tags" TO "anon";
GRANT ALL ON TABLE "public"."theory_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_article_bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."user_article_bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."user_article_bookmarks" TO "service_role";



GRANT ALL ON TABLE "public"."user_article_highlights" TO "anon";
GRANT ALL ON TABLE "public"."user_article_highlights" TO "authenticated";
GRANT ALL ON TABLE "public"."user_article_highlights" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_article_highlights_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_article_highlights_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_article_highlights_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_article_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_article_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_article_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_quotes" TO "anon";
GRANT ALL ON TABLE "public"."user_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."user_quotes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
