/*
  # Fix Blog RLS Performance and Security Issues

  1. Performance Optimization
    - Replace `auth.uid()` with `(SELECT auth.uid())` in all RLS policies
    - This prevents re-evaluation for each row, improving query performance at scale
    
  2. Security Improvements
    - Consolidate multiple permissive SELECT policies into single policies with OR conditions
    - Add search_path security to functions
    
  3. Index Optimization
    - Keep useful indexes, remove if truly unused after monitoring

  ## Changes Made:
  
  ### blog_posts policies:
  - Optimized: "Authors can view their own unpublished posts"
  - Optimized: "Authenticated users can create posts"
  - Optimized: "Authors can update their own posts"
  - Optimized: "Authors can delete their own posts"
  - Consolidated: "Published posts OR own unpublished posts" (single SELECT policy)
  
  ### blog_comments policies:
  - Optimized: "Users can view their own comments"
  - Optimized: "Authenticated users can create comments"
  - Optimized: "Users can update their own comments"
  - Optimized: "Users can delete their own comments"
  - Consolidated: "Approved comments OR own comments" (single SELECT policy)
  
  ### Functions:
  - Added SECURITY DEFINER and search_path to all functions
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON blog_posts;
DROP POLICY IF EXISTS "Authors can view their own unpublished posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON blog_posts;

DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON blog_comments;
DROP POLICY IF EXISTS "Users can view their own comments" ON blog_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON blog_comments;

-- ============================================================================
-- OPTIMIZED BLOG_POSTS POLICIES
-- ============================================================================

-- Consolidated SELECT policy: Published posts OR user's own posts
CREATE POLICY "View published posts or own posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    published = true 
    OR author_id = (SELECT auth.uid())
  );

-- Allow anonymous users to view published posts
CREATE POLICY "Anonymous users view published posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (published = true);

-- Optimized INSERT policy
CREATE POLICY "Authenticated users create own posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = (SELECT auth.uid()));

-- Optimized UPDATE policy
CREATE POLICY "Authors update own posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

-- Optimized DELETE policy
CREATE POLICY "Authors delete own posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (author_id = (SELECT auth.uid()));

-- ============================================================================
-- OPTIMIZED BLOG_COMMENTS POLICIES
-- ============================================================================

-- Consolidated SELECT policy: Approved comments OR user's own comments
CREATE POLICY "View approved comments or own comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (
    approved = true 
    OR user_id = (SELECT auth.uid())
  );

-- Allow anonymous users to view approved comments
CREATE POLICY "Anonymous users view approved comments"
  ON blog_comments FOR SELECT
  TO anon
  USING (approved = true);

-- Optimized INSERT policy
CREATE POLICY "Authenticated users create own comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimized UPDATE policy
CREATE POLICY "Users update own comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimized DELETE policy
CREATE POLICY "Users delete own comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- SECURE FUNCTIONS WITH SEARCH_PATH
-- ============================================================================

-- Recreate update_updated_at_column with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate increment_blog_post_views with secure search_path
CREATE OR REPLACE FUNCTION increment_blog_post_views(post_slug text)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE slug = post_slug;
END;
$$;

-- Recreate calculate_reading_time with secure search_path
CREATE OR REPLACE FUNCTION calculate_reading_time(post_content text)
RETURNS integer
IMMUTABLE
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  word_count integer;
  reading_minutes integer;
BEGIN
  word_count := array_length(regexp_split_to_array(post_content, '\s+'), 1);
  reading_minutes := GREATEST(1, CEIL(word_count::numeric / 200));
  RETURN reading_minutes;
END;
$$;

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION increment_blog_post_views(text) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_blog_post_views(text) TO anon;
GRANT EXECUTE ON FUNCTION calculate_reading_time(text) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_reading_time(text) TO anon;