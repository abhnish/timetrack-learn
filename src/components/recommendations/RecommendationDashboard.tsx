import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Award, Target } from 'lucide-react';
import { useRecommendations, useEducationalNews } from '@/hooks/useRecommendations';
import RecommendationCard from './RecommendationCard';
import NewsCard from './NewsCard';
import { CareerChatbot } from './CareerChatbot';
import { useToast } from '@/hooks/use-toast';

const RecommendationDashboard: React.FC = () => {
  const { 
    recommendations, 
    userStats, 
    loading: recommendationsLoading, 
    refetchRecommendations 
  } = useRecommendations();
  
  const { 
    news, 
    loading: newsLoading, 
    refetchNews 
  } = useEducationalNews();
  
  const { toast } = useToast();

  const handleJoinActivity = (activityId: string) => {
    // In a real implementation, this would navigate to the activity or show a join modal
    toast({
      title: "Activity Interest Noted",
      description: "We'll notify you when this activity becomes available for enrollment.",
    });
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchRecommendations(),
      refetchNews()
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{userStats.activities_completed}</p>
                  <p className="text-sm text-muted-foreground">Activities Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(userStats.attendance_rate * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{recommendations.length}</p>
                  <p className="text-sm text-muted-foreground">New Recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Recommendations Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🤖 AI-Powered Recommendations
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  Personalized
                </Badge>
              </CardTitle>
              <CardDescription>
                Activities tailored specifically for your academic journey and career goals
              </CardDescription>
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={recommendationsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${recommendationsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onJoinActivity={handleJoinActivity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Complete a few activities and attend classes to get personalized recommendations!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Career Guidance Chatbot and Educational News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CareerChatbot />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    📰 Educational News & Government Schemes
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      Live Updates
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Latest educational initiatives, scholarships, and government announcements
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {newsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-48 w-full" />
                    </div>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {news.map((newsItem) => (
                    <NewsCard
                      key={newsItem.id}
                      news={newsItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No educational news available at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDashboard;