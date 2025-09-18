'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/common/Layout';
import { PostDetail } from '@/components/posts/PostDetail';
import { PageLoading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { usePost } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeftIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const postId = parseInt(params.id as string);
  const { 
    post, 
    isLoading: postLoading, 
    error: postError,
    likePost,
    bookmarkPost,
    deletePost,
  } = usePost(postId);
  
  const { 
    data: comments = [], 
    isLoading: commentsLoading 
  } = useComments(postId);

  // Update document title when post loads
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | FinBoard`;
    }
    
    return () => {
      document.title = 'FinBoard';
    };
  }, [post]);

  const handleLike = async () => {
    try {
      await likePost();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarkPost();
    } catch (error) {
      console.error('Failed to bookmark post:', error);
    }
  };

  const handleEdit = () => {
    router.push(`/posts/${postId}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deletePost();
      toast.success('Post deleted successfully');
      router.push('/posts');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const handleReport = () => {
    // Implement report functionality
    toast.success('Post reported. Thank you for helping keep our community safe.');
  };

  if (postLoading) {
    return (
      <Layout>
        <div className="py-8">
          <PageLoading text="Loading post..." />
        </div>
      </Layout>
    );
  }

  if (postError || !post) {
    return (
      <Layout>
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Post Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <div className="space-x-4">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => router.push('/posts')}>
                Browse Posts
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isAuthor = user?.id === post.author.id;

  return (
    <>
      <Layout>
        <div className="py-8">
          {/* Back button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <PostDetail
            post={post}
            comments={comments}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onEdit={isAuthor ? handleEdit : undefined}
            onDelete={isAuthor ? () => setShowDeleteModal(true) : undefined}
            onShare={handleShare}
            onReport={!isAuthor ? handleReport : undefined}
          />
        </div>
      </Layout>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}