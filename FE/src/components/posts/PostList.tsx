import React, { useState, useCallback } from 'react';
import { PostCard } from './PostCard';
import { Post, PostFilters } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { PostSkeleton } from '@/components/ui/Loading';
import { usePosts } from '@/hooks/usePosts';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostListProps {
  filters?: PostFilters;
  variant?: 'default' | 'compact' | 'featured';
  showPagination?: boolean;
  limit?: number;
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  onPostAction?: (action: 'like' | 'bookmark', postId: number) => void;
}

export const PostList: React.FC<PostListProps> = ({
  filters = {},
  variant = 'default',
  showPagination = true,
  limit = 10,
  className,
  emptyMessage = 'No posts found',
  emptyDescription = 'Try adjusting your filters or check back later for new content.',
  onPostAction,
}) => {
  const {
    posts,
    isLoading,
    error,
    filters: currentFilters,
    updateFilter,
    likePost,
    bookmarkPost,
  } = usePosts({
    initialFilters: { ...filters, limit },
  });

  const handleLike = useCallback(async (postId: number) => {
    try {
      await likePost(postId);
      if (onPostAction) {
        onPostAction('like', postId);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  }, [likePost, onPostAction]);

  const handleBookmark = useCallback(async (postId: number) => {
    try {
      await bookmarkPost(postId);
      if (onPostAction) {
        onPostAction('bookmark', postId);
      }
    } catch (error) {
      console.error('Failed to bookmark post:', error);
    }
  }, [bookmarkPost, onPostAction]);

  const handlePageChange = useCallback((page: number) => {
    updateFilter('page', page);
    // Scroll to top of the list
    const element = document.getElementById('post-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [updateFilter]);

  const currentPage = currentFilters.page || 1;
  const totalPages = Math.ceil((posts.length || 0) / limit);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-lg font-medium mb-2">
          Error loading posts
        </div>
        <p className="text-muted-foreground mb-4">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)} id="post-list">
        {Array.from({ length: limit }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl font-bold text-foreground mb-4">
          {emptyMessage}
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          {emptyDescription}
        </p>
      </div>
    );
  }

  const getGridClasses = () => {
    switch (variant) {
      case 'compact':
        return 'grid grid-cols-1 gap-4';
      case 'featured':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      default:
        return 'space-y-6';
    }
  };

  const shouldShowFeatured = variant === 'default' && posts.length > 0;
  const featuredPost = shouldShowFeatured ? posts[0] : null;
  const regularPosts = shouldShowFeatured ? posts.slice(1) : posts;

  return (
    <div className={cn(className)} id="post-list">
      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-8">
          <PostCard
            post={featuredPost}
            variant="featured"
            onLike={handleLike}
            onBookmark={handleBookmark}
          />
        </div>
      )}

      {/* Regular Posts */}
      <div className={getGridClasses()}>
        {regularPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant={variant === 'featured' ? 'default' : variant}
            onLike={handleLike}
            onBookmark={handleBookmark}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              let page;
              if (totalPages <= 5) {
                page = index + 1;
              } else if (currentPage <= 3) {
                page = index + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + index;
              } else {
                page = currentPage - 2 + index;
              }

              const isActive = page === currentPage;

              return (
                <Button
                  key={page}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-10 h-10 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Results summary */}
      {posts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-6">
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, posts.length)} of {posts.length} posts
        </div>
      )}
    </div>
  );
};