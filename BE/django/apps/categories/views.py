from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.common.pagination import StandardResultsSetPagination
from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category model"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = StandardResultsSetPagination
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve', 'posts']:
            permission_classes = [permissions.AllowAny]
        else:
            # For create, update, delete - require authentication
            # In a real app, you might want admin-only permissions
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        """Delete category only if it has no posts"""
        category = self.get_object()
        post_count = category.posts.count()
        
        if post_count > 0:
            return Response(
                {'error': f'Cannot delete category with {post_count} posts. Move or delete posts first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Get all posts in a specific category"""
        category = self.get_object()
        from apps.posts.models import Post
        from apps.posts.serializers import PostSerializer
        
        posts = Post.objects.filter(
            category=category,
            is_published=True
        ).select_related('author', 'category').order_by('-created_at')
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response({
                'category': CategorySerializer(category).data,
                'posts': serializer.data
            })
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response({
            'category': CategorySerializer(category).data,
            'posts': serializer.data
        })