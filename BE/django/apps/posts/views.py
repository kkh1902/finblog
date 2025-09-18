from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from apps.common.permissions import IsAuthorOrReadOnly
from apps.common.pagination import StandardResultsSetPagination
from .models import Post, Tag, Like, Bookmark
from .serializers import (
    PostSerializer, PostCreateUpdateSerializer, TagSerializer,
    LikeSerializer, BookmarkSerializer
)
from .filters import PostFilter


class PostViewSet(viewsets.ModelViewSet):
    """ViewSet for Post model"""
    queryset = Post.objects.select_related('author', 'category').prefetch_related('tags')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PostFilter
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at', 'view_count', 'like_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PostCreateUpdateSerializer
        return PostSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter queryset based on user and publication status"""
        queryset = self.queryset
        
        if self.action == 'list':
            # For list view, only show published posts
            queryset = queryset.filter(is_published=True)
        elif self.action == 'retrieve':
            # For detail view, show published posts or user's own posts
            if self.request.user.is_authenticated:
                queryset = queryset.filter(
                    models.Q(is_published=True) | 
                    models.Q(author=self.request.user)
                )
            else:
                queryset = queryset.filter(is_published=True)
        
        return queryset

    def perform_create(self, serializer):
        """Set the author to the current user"""
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Increment view count when retrieving a post"""
        instance = self.get_object()
        
        # Increment view count (but not for the author)
        if not request.user.is_authenticated or request.user != instance.author:
            instance.increment_view_count()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'])
    def like(self, request, pk=None):
        """Like or unlike a post"""
        post = self.get_object()
        
        try:
            like = Like.objects.get(user=request.user, post=post)
            if request.method == 'DELETE':
                like.delete()
                return Response({'message': 'Post unliked successfully'})
            else:
                return Response({'message': 'Post already liked'}, status=status.HTTP_400_BAD_REQUEST)
        except Like.DoesNotExist:
            if request.method == 'POST':
                Like.objects.create(user=request.user, post=post)
                return Response({'message': 'Post liked successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Post not liked'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post', 'delete'])
    def bookmark(self, request, pk=None):
        """Bookmark or unbookmark a post"""
        post = self.get_object()
        
        try:
            bookmark = Bookmark.objects.get(user=request.user, post=post)
            if request.method == 'DELETE':
                bookmark.delete()
                return Response({'message': 'Post unbookmarked successfully'})
            else:
                return Response({'message': 'Post already bookmarked'}, status=status.HTTP_400_BAD_REQUEST)
        except Bookmark.DoesNotExist:
            if request.method == 'POST':
                Bookmark.objects.create(user=request.user, post=post)
                return Response({'message': 'Post bookmarked successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Post not bookmarked'}, status=status.HTTP_400_BAD_REQUEST)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Tag model (read-only)"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Get all posts with this tag"""
        tag = self.get_object()
        posts = Post.objects.filter(
            tags=tag,
            is_published=True
        ).select_related('author', 'category').order_by('-created_at')
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response({
                'tag': TagSerializer(tag).data,
                'posts': serializer.data
            })
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response({
            'tag': TagSerializer(tag).data,
            'posts': serializer.data
        })