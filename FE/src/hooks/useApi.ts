import useSWR, { KeyedMutator, SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { ApiError, UseApiOptions, UseApiReturn } from '@/lib/types';

// Generic fetcher function for SWR
const fetcher = async (url: string) => {
  const [endpoint, ...params] = url.split('|');
  
  switch (endpoint) {
    case 'posts':
      return apiClient.getPosts(params[0] ? JSON.parse(params[0]) : undefined);
    case 'post':
      return apiClient.getPost(parseInt(params[0]));
    case 'comments':
      return apiClient.getComments(parseInt(params[0]));
    case 'categories':
      return apiClient.getCategories();
    case 'category':
      return apiClient.getCategory(parseInt(params[0]));
    case 'tags':
      return apiClient.getTags();
    case 'tag':
      return apiClient.getTag(parseInt(params[0]));
    case 'users':
      return apiClient.getUsers();
    case 'user':
      return apiClient.getUser(parseInt(params[0]));
    case 'user-by-username':
      return apiClient.getUserByUsername(params[0]);
    case 'profile':
      return apiClient.getProfile();
    case 'search-posts':
      return apiClient.searchPosts(params[0], params[1] ? JSON.parse(params[1]) : undefined);
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

// Generic useApi hook
export const useApi = <T>(
  key: string | null,
  options?: UseApiOptions & SWRConfiguration
): UseApiReturn<T> => {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    refreshInterval = 0,
    dedupingInterval = 2000,
    ...swrOptions
  } = options || {};

  const { data, error, isLoading, isValidating, mutate } = useSWR<T, ApiError>(
    key,
    fetcher,
    {
      revalidateOnFocus,
      revalidateOnReconnect,
      refreshInterval,
      dedupingInterval,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      ...swrOptions,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

// Specialized hooks for different endpoints
export const usePosts = (filters?: any, options?: UseApiOptions) => {
  const key = filters ? `posts|${JSON.stringify(filters)}` : 'posts';
  return useApi(key, options);
};

export const usePost = (id: number | null, options?: UseApiOptions) => {
  const key = id ? `post|${id}` : null;
  return useApi(key, options);
};

export const useComments = (postId: number | null, options?: UseApiOptions) => {
  const key = postId ? `comments|${postId}` : null;
  return useApi(key, options);
};

export const useCategories = (options?: UseApiOptions) => {
  return useApi('categories', options);
};

export const useCategory = (id: number | null, options?: UseApiOptions) => {
  const key = id ? `category|${id}` : null;
  return useApi(key, options);
};

export const useTags = (options?: UseApiOptions) => {
  return useApi('tags', options);
};

export const useTag = (id: number | null, options?: UseApiOptions) => {
  const key = id ? `tag|${id}` : null;
  return useApi(key, options);
};

export const useUsers = (options?: UseApiOptions) => {
  return useApi('users', options);
};

export const useUser = (id: number | null, options?: UseApiOptions) => {
  const key = id ? `user|${id}` : null;
  return useApi(key, options);
};

export const useUserByUsername = (username: string | null, options?: UseApiOptions) => {
  const key = username ? `user-by-username|${username}` : null;
  return useApi(key, options);
};

export const useProfile = (options?: UseApiOptions) => {
  return useApi('profile', options);
};

export const useSearchPosts = (query: string | null, filters?: any, options?: UseApiOptions) => {
  const key = query ? `search-posts|${query}|${JSON.stringify(filters || {})}` : null;
  return useApi(key, options);
};

// Mutation hooks for write operations
export const useCreatePost = () => {
  return useCallback(async (postData: any) => {
    return apiClient.createPost(postData);
  }, []);
};

export const useUpdatePost = () => {
  return useCallback(async (id: number, postData: any) => {
    return apiClient.updatePost(id, postData);
  }, []);
};

export const useDeletePost = () => {
  return useCallback(async (id: number) => {
    return apiClient.deletePost(id);
  }, []);
};

export const useLikePost = () => {
  return useCallback(async (id: number) => {
    return apiClient.likePost(id);
  }, []);
};

export const useBookmarkPost = () => {
  return useCallback(async (id: number) => {
    return apiClient.bookmarkPost(id);
  }, []);
};

export const useCreateComment = () => {
  return useCallback(async (commentData: any) => {
    return apiClient.createComment(commentData);
  }, []);
};

export const useUpdateComment = () => {
  return useCallback(async (id: number, commentData: any) => {
    return apiClient.updateComment(id, commentData);
  }, []);
};

export const useDeleteComment = () => {
  return useCallback(async (id: number) => {
    return apiClient.deleteComment(id);
  }, []);
};

export const useLikeComment = () => {
  return useCallback(async (id: number) => {
    return apiClient.likeComment(id);
  }, []);
};