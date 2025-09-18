import { useState, useCallback, useMemo } from 'react';
import { usePosts as usePostsApi, useCreatePost, useUpdatePost, useDeletePost, useLikePost, useBookmarkPost } from './useApi';
import { Post, PostFilters, CreatePostRequest, UpdatePostRequest, ApiError } from '@/lib/types';
import { mutate } from 'swr';
import toast from 'react-hot-toast';

export interface UsePostsOptions {
  initialFilters?: PostFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UsePostsReturn {
  // Data
  posts: Post[];
  isLoading: boolean;
  error: ApiError | undefined;
  
  // Filters
  filters: PostFilters;
  setFilters: (filters: PostFilters) => void;
  updateFilter: (key: keyof PostFilters, value: any) => void;
  clearFilters: () => void;
  
  // Actions
  createPost: (postData: CreatePostRequest) => Promise<Post>;
  updatePost: (id: number, postData: UpdatePostRequest) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
  likePost: (id: number) => Promise<void>;
  bookmarkPost: (id: number) => Promise<void>;
  
  // Utilities
  refreshPosts: () => Promise<void>;
  getPostById: (id: number) => Post | undefined;
  searchPosts: (query: string) => void;
}

const defaultFilters: PostFilters = {
  page: 1,
  limit: 10,
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
  const {
    initialFilters = defaultFilters,
    autoRefresh = false,
    refreshInterval = 0,
  } = options;

  const [filters, setFilters] = useState<PostFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  // API hooks
  const { data: postsResponse, isLoading, error, mutate: mutatePosts } = usePostsApi(
    filters,
    {
      revalidateOnFocus: autoRefresh,
      refreshInterval: autoRefresh ? refreshInterval : 0,
    }
  );

  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const likePostMutation = useLikePost();
  const bookmarkPostMutation = useBookmarkPost();

  // Extract posts from response
  const posts = useMemo(() => {
    if (!postsResponse) return [];
    
    // Handle both paginated and direct array responses
    if (Array.isArray(postsResponse)) {
      return postsResponse;
    }
    
    return postsResponse.data || [];
  }, [postsResponse]);

  // Filter management
  const updateFilter = useCallback((key: keyof PostFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset to first page when changing filters (except page)
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Actions
  const createPost = useCallback(async (postData: CreatePostRequest): Promise<Post> => {
    try {
      const newPost = await createPostMutation(postData);
      
      // Optimistically update the posts list
      await mutatePosts();
      
      toast.success('Post created successfully!');
      return newPost;
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to create post');
      throw error;
    }
  }, [createPostMutation, mutatePosts]);

  const updatePost = useCallback(async (id: number, postData: UpdatePostRequest): Promise<Post> => {
    try {
      const updatedPost = await updatePostMutation(id, postData);
      
      // Update the posts list and individual post cache
      await Promise.all([
        mutatePosts(),
        mutate(`post|${id}`),
      ]);
      
      toast.success('Post updated successfully!');
      return updatedPost;
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to update post');
      throw error;
    }
  }, [updatePostMutation, mutatePosts]);

  const deletePost = useCallback(async (id: number): Promise<void> => {
    try {
      await deletePostMutation(id);
      
      // Update the posts list and clear individual post cache
      await Promise.all([
        mutatePosts(),
        mutate(`post|${id}`, undefined, false),
      ]);
      
      toast.success('Post deleted successfully!');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to delete post');
      throw error;
    }
  }, [deletePostMutation, mutatePosts]);

  const likePost = useCallback(async (id: number): Promise<void> => {
    try {
      await likePostMutation(id);
      
      // Optimistically update the UI
      await Promise.all([
        mutatePosts(),
        mutate(`post|${id}`),
      ]);
      
      // Don't show toast for likes as it's too noisy
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to like post');
      throw error;
    }
  }, [likePostMutation, mutatePosts]);

  const bookmarkPost = useCallback(async (id: number): Promise<void> => {
    try {
      await bookmarkPostMutation(id);
      
      // Optimistically update the UI
      await Promise.all([
        mutatePosts(),
        mutate(`post|${id}`),
      ]);
      
      toast.success('Bookmark updated!');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to update bookmark');
      throw error;
    }
  }, [bookmarkPostMutation, mutatePosts]);

  // Utilities
  const refreshPosts = useCallback(async (): Promise<void> => {
    await mutatePosts();
  }, [mutatePosts]);

  const getPostById = useCallback((id: number): Post | undefined => {
    return posts.find(post => post.id === id);
  }, [posts]);

  const searchPosts = useCallback((query: string): void => {
    updateFilter('search', query);
  }, [updateFilter]);

  return {
    // Data
    posts,
    isLoading,
    error,
    
    // Filters
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    
    // Actions
    createPost,
    updatePost,
    deletePost,
    likePost,
    bookmarkPost,
    
    // Utilities
    refreshPosts,
    getPostById,
    searchPosts,
  };
};

// Hook for managing a single post
export const usePost = (id: number | null) => {
  const { data: post, isLoading, error, mutate: mutatePost } = usePostsApi(
    id ? { ids: [id] } : null
  );

  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const likePostMutation = useLikePost();
  const bookmarkPostMutation = useBookmarkPost();

  const updatePost = useCallback(async (postData: UpdatePostRequest): Promise<Post> => {
    if (!id) throw new Error('Post ID is required');
    
    try {
      const updatedPost = await updatePostMutation(id, postData);
      await mutatePost();
      toast.success('Post updated successfully!');
      return updatedPost;
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to update post');
      throw error;
    }
  }, [id, updatePostMutation, mutatePost]);

  const deletePost = useCallback(async (): Promise<void> => {
    if (!id) throw new Error('Post ID is required');
    
    try {
      await deletePostMutation(id);
      await mutatePost();
      toast.success('Post deleted successfully!');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to delete post');
      throw error;
    }
  }, [id, deletePostMutation, mutatePost]);

  const likePost = useCallback(async (): Promise<void> => {
    if (!id) throw new Error('Post ID is required');
    
    try {
      await likePostMutation(id);
      await mutatePost();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to like post');
      throw error;
    }
  }, [id, likePostMutation, mutatePost]);

  const bookmarkPost = useCallback(async (): Promise<void> => {
    if (!id) throw new Error('Post ID is required');
    
    try {
      await bookmarkPostMutation(id);
      await mutatePost();
      toast.success('Bookmark updated!');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to update bookmark');
      throw error;
    }
  }, [id, bookmarkPostMutation, mutatePost]);

  return {
    post: Array.isArray(post) ? post[0] : post,
    isLoading,
    error,
    updatePost,
    deletePost,
    likePost,
    bookmarkPost,
    refresh: mutatePost,
  };
};