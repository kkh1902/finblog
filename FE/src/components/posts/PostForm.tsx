'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Post, CreatePostRequest, UpdatePostRequest, Category, Tag } from '@/lib/types';
import { usePosts } from '@/hooks/usePosts';
import { useCategories, useTags } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  SaveIcon, 
  EyeIcon, 
  PublishIcon,
  XIcon,
  PlusIcon,
  ImageIcon,
  TagIcon,
  FolderIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  categoryId: z.number().min(1, 'Please select a category'),
  tagIds: z.array(z.number()).optional(),
  featuredImage: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']).default('draft'),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  post?: Post;
  onSuccess?: (post: Post) => void;
  onCancel?: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({
  post,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const router = useRouter();
  const { createPost, updatePost } = usePosts();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

  const isEditing = !!post;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      categoryId: post?.category?.id || 0,
      tagIds: post?.tags?.map(tag => tag.id) || [],
      featuredImage: post?.featuredImage || '',
      status: post?.status || 'draft',
    },
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  // Initialize selected tags
  useEffect(() => {
    if (post?.tags) {
      setSelectedTags(post.tags);
    }
  }, [post]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (watchedContent && !isEditing) {
      const excerpt = watchedContent
        .replace(/[#*`>\-\[\]]/g, '') // Remove markdown
        .trim()
        .slice(0, 200);
      setValue('excerpt', excerpt);
    }
  }, [watchedContent, setValue, isEditing]);

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    
    try {
      const postData = {
        ...data,
        tagIds: selectedTags.map(tag => tag.id),
        categoryId: Number(data.categoryId),
      };

      let result: Post;
      
      if (isEditing) {
        result = await updatePost(post.id, postData as UpdatePostRequest);
        toast.success('Post updated successfully!');
      } else {
        result = await createPost(postData as CreatePostRequest);
        toast.success('Post created successfully!');
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/posts/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleCreateNewTag = () => {
    if (newTagName.trim()) {
      // In a real app, you'd create the tag via API
      const newTag: Tag = {
        id: Date.now(), // Temporary ID
        name: newTagName.trim(),
        slug: newTagName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: '',
        color: '',
        postsCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      handleAddTag(newTag);
      setNewTagName('');
      setShowTagInput(false);
    }
  };

  const handleSaveDraft = () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  if (previewMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Preview</h1>
          <Button onClick={togglePreview} variant="outline">
            <XIcon className="h-4 w-4 mr-2" />
            Exit Preview
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8">
            {/* Preview content would go here */}
            <div className="prose prose-lg max-w-none">
              <h1>{watchedTitle}</h1>
              <div dangerouslySetInnerHTML={{ __html: watchedContent }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>
          
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={togglePreview}
              disabled={!watchedTitle || !watchedContent}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSaveDraft}
              loading={isSubmitting}
              disabled={!isDirty}
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            <Button 
              type="button" 
              onClick={handlePublish}
              loading={isSubmitting}
              disabled={!watchedTitle || !watchedContent}
            >
              <PublishIcon className="h-4 w-4 mr-2" />
              Publish
            </Button>
            
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Input
                  {...register('title')}
                  label="Title"
                  placeholder="Enter your post title..."
                  error={errors.title?.message}
                  className="text-lg font-semibold"
                />

                <Textarea
                  {...register('content')}
                  label="Content"
                  placeholder="Write your post content using Markdown..."
                  error={errors.content?.message}
                  rows={20}
                  className="font-mono"
                />

                <Input
                  {...register('excerpt')}
                  label="Excerpt (Optional)"
                  placeholder="Brief description of your post..."
                  error={errors.excerpt?.message}
                  helperText="This will be used as the preview text"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  {...register('featuredImage')}
                  placeholder="Enter image URL..."
                  error={errors.featuredImage?.message}
                />
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <FolderIcon className="h-4 w-4 mr-2" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Select a category...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center">
                    <TagIcon className="h-4 w-4 mr-2" />
                    Tags
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTagInput(!showTagInput)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{tag.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* New Tag Input */}
                {showTagInput && (
                  <div className="flex space-x-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Tag name..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateNewTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateNewTag}
                    >
                      Add
                    </Button>
                  </div>
                )}

                {/* Available Tags */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Available Tags:</h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {tags
                      .filter(tag => !selectedTags.find(st => st.id === tag.id))
                      .map((tag) => (
                        <Button
                          key={tag.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTag(tag)}
                          className="text-xs"
                        >
                          {tag.name}
                        </Button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};