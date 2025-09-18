import React, { useState } from 'react';
import { Comment, CreateCommentRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { CommentSkeleton } from '@/components/ui/Loading';
import { 
  MessageSquareIcon, 
  ReplyIcon, 
  HeartIcon, 
  UserIcon,
  EditIcon,
  TrashIcon,
  FlagIcon
} from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment, useLikeComment } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CommentItemProps {
  comment: Comment;
  level?: number;
  onReply?: (parentId: number, content: string) => void;
  onEdit?: (commentId: number, content: string) => void;
  onDelete?: (commentId: number) => void;
  onLike?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  level = 0,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onReport,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = user?.id === comment.author.id;
  const maxNestingLevel = 3;
  const canReply = isAuthenticated && level < maxNestingLevel;

  const handleReply = async () => {
    if (!replyContent.trim() || !onReply) return;
    
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || !onEdit) return;
    
    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editContent);
      setShowEditForm(false);
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    if (onLike && isAuthenticated) {
      onLike(comment.id);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(comment.id);
    }
  };

  return (
    <div className={cn('border-l-2 border-border pl-4', level > 0 && 'ml-4')}>
      <div className="space-y-3">
        {/* Comment Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              {comment.author.avatar ? (
                <img
                  src={comment.author.avatar}
                  alt={comment.author.username}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-primary-foreground" />
              )}
            </div>
            <div>
              <span className="font-medium text-sm">{comment.author.username}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-xs text-muted-foreground ml-1">(edited)</span>
              )}
            </div>
          </div>
          
          {/* Comment actions */}
          <div className="flex items-center space-x-1">
            {isAuthor && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="h-6 w-6 p-0"
                >
                  <EditIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </>
            )}
            {!isAuthor && onReport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReport}
                className="h-6 w-6 p-0"
              >
                <FlagIcon className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Comment Content */}
        {showEditForm ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your comment..."
              rows={3}
            />
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleEdit}
                loading={isSubmitting}
                disabled={!editContent.trim()}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditContent(comment.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={cn(
              'flex items-center space-x-1 h-6 text-xs',
              comment.isLiked && 'text-red-500'
            )}
          >
            <HeartIcon className={cn(
              'h-3 w-3',
              comment.isLiked && 'fill-current'
            )} />
            <span>{formatNumber(comment.likesCount)}</span>
          </Button>
          
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 h-6 text-xs"
            >
              <ReplyIcon className="h-3 w-3" />
              <span>Reply</span>
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
            />
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleReply}
                loading={isSubmitting}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Nested Comments */}
        {comment.children && comment.children.length > 0 && (
          <div className="space-y-4 mt-4">
            {comment.children.map((childComment) => (
              <CommentItem
                key={childComment.id}
                comment={childComment}
                level={level + 1}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface CommentSectionProps {
  postId: number;
  comments?: Comment[];
  commentsCount?: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments: initialComments,
  commentsCount = 0,
}) => {
  const { isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API hooks
  const { data: comments = initialComments || [], isLoading, mutate: mutateComments } = useComments(postId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const likeComment = useLikeComment();

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const commentData: CreateCommentRequest = {
        content: newComment,
        postId,
      };
      
      await createComment(commentData);
      await mutateComments();
      setNewComment('');
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    const commentData: CreateCommentRequest = {
      content,
      postId,
      parentId,
    };
    
    await createComment(commentData);
    await mutateComments();
    toast.success('Reply posted successfully!');
  };

  const handleEdit = async (commentId: number, content: string) => {
    await updateComment(commentId, { id: commentId, content });
    await mutateComments();
    toast.success('Comment updated successfully!');
  };

  const handleDelete = async (commentId: number) => {
    await deleteComment(commentId);
    await mutateComments();
    toast.success('Comment deleted successfully!');
  };

  const handleLike = async (commentId: number) => {
    await likeComment(commentId);
    await mutateComments();
  };

  const handleReport = async (commentId: number) => {
    // Implement report functionality
    toast.success('Comment reported');
  };

  // Filter top-level comments (those without a parent)
  const topLevelComments = comments.filter(comment => !comment.parent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquareIcon className="h-5 w-5" />
          <span>Comments ({formatNumber(commentsCount)})</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {isAuthenticated ? (
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                loading={isSubmitting}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              You need to be logged in to post comments.
            </p>
            <Button asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <CommentSkeleton key={index} />
            ))}
          </div>
        ) : topLevelComments.length > 0 ? (
          <div className="space-y-6">
            {topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLike={handleLike}
                onReport={handleReport}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquareIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};