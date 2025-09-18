import React from 'react';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  HeartIcon, 
  MessageSquareIcon, 
  BookmarkIcon, 
  EyeIcon, 
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import { formatRelativeTime, truncateText, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onLike?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  variant = 'default',
  showActions = true,
  onLike,
  onBookmark,
  className,
}) => {
  const { isAuthenticated } = useAuth();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike && isAuthenticated) {
      onLike(post.id);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookmark && isAuthenticated) {
      onBookmark(post.id);
    }
  };

  const renderCompactCard = () => (
    <Link href={`/posts/${post.id}`}>
      <Card className={cn('card-hover cursor-pointer', className)}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {post.featuredImage && (
              <div className="flex-shrink-0">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {post.category.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(post.publishedAt || post.createdAt)}
                </span>
              </div>
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                {post.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <HeartIcon className="h-3 w-3 mr-1" />
                    {formatNumber(post.likesCount)}
                  </span>
                  <span className="flex items-center">
                    <MessageSquareIcon className="h-3 w-3 mr-1" />
                    {formatNumber(post.commentsCount)}
                  </span>
                </div>
                <span className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {post.readTime || 5} min read
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderFeaturedCard = () => (
    <Link href={`/posts/${post.id}`}>
      <Card className={cn('card-hover cursor-pointer', className)}>
        {post.featuredImage && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="default">
              {post.category.name}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(post.publishedAt || post.createdAt)}
            </span>
          </div>
          <h2 className="text-2xl font-bold line-clamp-2 mb-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </CardHeader>
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {post.author.username}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {formatNumber(post.viewsCount)}
              </span>
              <span className="flex items-center">
                <HeartIcon className="h-4 w-4 mr-1" />
                {formatNumber(post.likesCount)}
              </span>
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {post.readTime || 5} min
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );

  const renderDefaultCard = () => (
    <Card className={cn('card-hover', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.username}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <UserIcon className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <Link 
                href={`/profile/${post.author.username}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {post.author.username}
              </Link>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatRelativeTime(post.publishedAt || post.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {post.readTime || 5} min read
                </span>
              </div>
            </div>
          </div>
          {showActions && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {post.category.name}
            </Badge>
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                #{tag.name}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 2}
              </Badge>
            )}
          </div>
          
          <Link href={`/posts/${post.id}`}>
            <h3 className="text-xl font-bold line-clamp-2 hover:text-primary transition-colors cursor-pointer">
              {post.title}
            </h3>
          </Link>
          
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </div>
      </CardHeader>

      {post.featuredImage && (
        <div className="px-6">
          <Link href={`/posts/${post.id}`}>
            <div className="aspect-video overflow-hidden rounded-lg cursor-pointer">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>
      )}

      {showActions && (
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={cn(
                'flex items-center space-x-1',
                post.isLiked && 'text-red-500'
              )}
            >
              <HeartIcon className={cn(
                'h-4 w-4',
                post.isLiked && 'fill-current'
              )} />
              <span>{formatNumber(post.likesCount)}</span>
            </Button>
            
            <Link href={`/posts/${post.id}#comments`}>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <MessageSquareIcon className="h-4 w-4" />
                <span>{formatNumber(post.commentsCount)}</span>
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4" />
              <span>{formatNumber(post.viewsCount)}</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            disabled={!isAuthenticated}
            className={cn(
              'flex items-center space-x-1',
              post.isBookmarked && 'text-blue-500'
            )}
          >
            <BookmarkIcon className={cn(
              'h-4 w-4',
              post.isBookmarked && 'fill-current'
            )} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  if (variant === 'compact') {
    return renderCompactCard();
  }

  if (variant === 'featured') {
    return renderFeaturedCard();
  }

  return renderDefaultCard();
};