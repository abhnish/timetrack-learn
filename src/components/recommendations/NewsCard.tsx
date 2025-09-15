import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar } from 'lucide-react';
import { EducationalNews } from '@/hooks/useRecommendations';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  news: EducationalNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'scholarships': return 'bg-green-100 text-green-800';
      case 'digital-education': return 'bg-blue-100 text-blue-800';
      case 'skill-development': return 'bg-purple-100 text-purple-800';
      case 'career-guidance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'scholarships': return '🎓';
      case 'digital-education': return '💻';
      case 'skill-development': return '🛠️';
      case 'career-guidance': return '🎯';
      case 'online-learning': return '📱';
      default: return '📢';
    }
  };

  const handleReadMore = () => {
    if (news.link) {
      window.open(news.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">
            {getCategoryIcon(news.category)}
          </span>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {news.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>
                {news.published_at 
                  ? formatDistanceToNow(new Date(news.published_at), { addSuffix: true })
                  : 'Recently'
                }
              </span>
            </div>
            <Badge className={getCategoryColor(news.category)}>
              {news.category.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">
          {news.description}
        </CardDescription>
        
        <div className="text-sm text-muted-foreground">
          <strong>Source:</strong> {news.source}
        </div>
        
        {news.link && (
          <Button 
            onClick={handleReadMore}
            variant="outline"
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Read Full Article
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsCard;