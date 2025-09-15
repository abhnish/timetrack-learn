import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, TrendingUp } from 'lucide-react';
import { ActivityRecommendation } from '@/hooks/useRecommendations';

interface RecommendationCardProps {
  recommendation: ActivityRecommendation;
  onJoinActivity: (activityId: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onJoinActivity 
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'career': return '💼';
      case 'academic': return '📚';
      case 'skill': return '🛠️';
      default: return '🎯';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getTypeIcon(recommendation.activity_type)}</span>
            <CardTitle className="text-lg line-clamp-2">{recommendation.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">
              {Math.round(recommendation.recommendation_score)}
            </span>
          </div>
        </div>
        <CardDescription className="line-clamp-3">
          {recommendation.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{recommendation.duration_minutes} min</span>
          </div>
          <Badge className={getDifficultyColor(recommendation.difficulty_level)}>
            {recommendation.difficulty_level}
          </Badge>
        </div>
        
        {recommendation.tags && recommendation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recommendation.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recommendation.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recommendation.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            {recommendation.recommendation_reason}
          </p>
        </div>
        
        <Button 
          onClick={() => onJoinActivity(recommendation.id)}
          className="w-full"
        >
          Join Activity
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;