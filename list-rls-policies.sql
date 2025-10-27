-- List all RLS policies in the database
-- This will help us see what RLS policies are currently enabled

-- 1. Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. List all RLS policies with details
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Alternative detailed view from pg_policy system catalog
SELECT 
    n.nspname as schemaname,
    c.relname as tablename,
    p.polname as policyname,
    CASE p.polpermissive
        WHEN 't' THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END as permissive,
    CASE p.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command,
    CASE 
        WHEN p.polqual IS NOT NULL THEN pg_get_expr(p.polqual, p.polrelid)
        ELSE NULL
    END as using_clause,
    CASE 
        WHEN p.polwithcheck IS NOT NULL THEN pg_get_expr(p.polwithcheck, p.polrelid)
        ELSE NULL
    END as with_check_clause,
    pg_catalog.pg_get_userbyid(p.polroles[1]) as role
FROM pg_catalog.pg_policy p
JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
ORDER BY c.relname, p.polname;

-- 4. Summary count of policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
