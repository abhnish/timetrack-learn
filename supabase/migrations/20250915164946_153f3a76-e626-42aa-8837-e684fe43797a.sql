-- Fix RLS policy for educational news to allow system insertions
-- Drop the existing restrictive policy
DROP POLICY "Admins can manage educational news" ON public.educational_news;

-- Create new policies that allow system insertions but restrict user access properly
CREATE POLICY "Everyone can view educational news"
ON public.educational_news
FOR SELECT
USING (true);

CREATE POLICY "System can insert educational news"
ON public.educational_news
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update educational news"
ON public.educational_news
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete educational news"
ON public.educational_news
FOR DELETE
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));