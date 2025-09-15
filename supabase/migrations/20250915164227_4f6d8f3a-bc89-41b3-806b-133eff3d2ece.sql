-- Create table for tracking user activity participation history
CREATE TABLE public.user_activity_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_id UUID NOT NULL,
    participated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completion_status TEXT DEFAULT 'completed',
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for educational news and announcements
CREATE TABLE public.educational_news (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    source TEXT DEFAULT 'government',
    category TEXT DEFAULT 'general',
    published_at TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user recommendation preferences
CREATE TABLE public.user_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    preferred_activity_types TEXT[] DEFAULT ARRAY['academic', 'career'],
    notification_frequency TEXT DEFAULT 'weekly',
    recommendation_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_activity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_activity_history
CREATE POLICY "Users can view their own activity history"
ON public.user_activity_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity history"
ON public.user_activity_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Faculty and admins can view all activity history"
ON public.user_activity_history
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('faculty', 'admin')
));

-- RLS policies for educational_news
CREATE POLICY "Everyone can view educational news"
ON public.educational_news
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage educational news"
ON public.educational_news
FOR ALL
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences
FOR ALL
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_user_activity_history_user_id ON public.user_activity_history(user_id);
CREATE INDEX idx_user_activity_history_activity_id ON public.user_activity_history(activity_id);
CREATE INDEX idx_educational_news_published_at ON public.educational_news(published_at DESC);
CREATE INDEX idx_educational_news_category ON public.educational_news(category);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_educational_news_updated_at
    BEFORE UPDATE ON public.educational_news
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();