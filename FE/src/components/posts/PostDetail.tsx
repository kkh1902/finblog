import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Post, Comment } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { 
  HeartIcon, 
  MessageSquareIcon, 
  BookmarkIcon, 
  ShareIcon,
  EyeIcon, 
  UserIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  TrashIcon,
  FlagIcon
} from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CommentSection } from './CommentSection';

interface PostDetailProps {
  post: Post;
  comments?: Comment[];
  onLike?: () => void;
  onBookmark?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  className?: string;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  comments = [],
  onLike,
  onBookmark,
  onEdit,
  onDelete,
  onShare,
  onReport,
  className,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showComments, setShowComments] = useState(true);

  const isAuthor = user?.id === post.author.id;

  const handleLike = () => {
    if (onLike && isAuthenticated) {
      onLike();
    }
  };

  const handleBookmark = () => {
    if (onBookmark && isAuthenticated) {
      onBookmark();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast here
    }
    
    if (onShare) {
      onShare();
    }
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={cn('bg-muted px-1 py-0.5 rounded text-sm', className)} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-4 text-foreground leading-relaxed">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-4 text-foreground">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-4 text-foreground">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="mb-1">{children}</li>
    ),
    a: ({ href, children }: any) => (
      <a 
        href={href} 
        className="text-primary hover:text-primary/80 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }: any) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-lg my-4 mx-auto block"
      />
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-border px-4 py-2 bg-muted text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-border px-4 py-2">{children}</td>
    ),
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Post Header */}
      <Card className="mb-6">
        <CardHeader>
          {/* Post Meta */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <div>
                <Link 
                  href={`/profile/${post.author.username}`}
                  className="font-semibold hover:text-primary transition-colors"
                >
                  {post.author.username}
                </Link>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatRelativeTime(post.publishedAt || post.createdAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {post.readTime || 5} min read
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <EyeIcon className="h-3 w-3 mr-1" />
                    {formatNumber(post.viewsCount)} views
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action buttons for author */}
            {isAuthor && (
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <EditIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Tags and Category */}
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default">{post.category.name}</Badge>
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                #{tag.name}
              </Badge>
            ))}
          </div>

          {/* Post Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {post.title}
          </h1>

          {/* Post Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </CardHeader>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="px-6">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Post Actions */}
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
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquareIcon className="h-4 w-4" />
              <span>{formatNumber(post.commentsCount)}</span>
            </Button>
            
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
            
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <ShareIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {!isAuthor && onReport && (
            <Button variant="ghost" size="sm" onClick={onReport}>
              <FlagIcon className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Post Content */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Author Bio */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.username}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {post.author.firstName && post.author.lastName
                  ? `${post.author.firstName} ${post.author.lastName}`
                  : post.author.username}
              </h3>
              {post.author.bio && (
                <p className="text-muted-foreground mb-3">{post.author.bio}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{post.author.postsCount || 0} posts</span>
                <span>{post.author.followersCount || 0} followers</span>
              </div>
            </div>
            <Link href={`/profile/${post.author.username}`}>
              <Button variant="outline">View Profile</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={comments}
          commentsCount={post.commentsCount}
        />
      )}
    </div>
  );
};