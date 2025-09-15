import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ActivityRecommendation {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  difficulty_level: string;
  duration_minutes: number;
  tags: string[];
  recommendation_score: number;
  recommendation_reason: string;
}

export interface UserStats {
  activities_completed: number;
  attendance_rate: number;
}

export interface EducationalNews {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
  category: string;
  published_at: string;
  is_featured: boolean;
}

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('activity-recommendations', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      setUserStats(data.user_stats || null);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load personalized recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [isAuthenticated, user?.id]);

  return {
    recommendations,
    userStats,
    loading,
    refetchRecommendations: fetchRecommendations
  };
};

export const useEducationalNews = () => {
  const [news, setNews] = useState<EducationalNews[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEducationalNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('educational-news');

      if (error) throw error;

      setNews(data.news || []);
    } catch (error: any) {
      console.error('Error fetching educational news:', error);
      toast({
        title: "Error",
        description: "Failed to load educational news",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducationalNews();
  }, []);

  return {
    news,
    loading,
    refetchNews: fetchEducationalNews
  };
};