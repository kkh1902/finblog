'use client';

import { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import Layout from '@/components/common/Layout';
import { PostForm } from '@/components/posts/PostForm';
import { Post } from '@/lib/types';
import { withAuth } from '@/contexts/AuthContext';

function CreatePostPage() {
  const router = useRouter();

  const handleSuccess = (post: Post) => {
    router.push(`/posts/${post.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout>
      <div className="py-8">
        <PostForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Layout>
  );
}

export default withAuth(CreatePostPage);