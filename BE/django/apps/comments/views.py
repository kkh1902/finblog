from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from apps.common.permissions import IsAuthorOrReadOnly
from apps.common.pagination import StandardResultsSetPagination
from apps.posts.models import Post
from .models import Comment
from .serializers import CommentSerializer, CommentCreateUpdateSerializer


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for Comment model"""
    queryset = Comment.objects.select_related('author', 'post').all()
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post', 'author', 'parent']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CommentCreateUpdateSerializer
        return CommentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'post_comments']:
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter comments to only show top-level comments by default"""
        queryset = self.queryset
        
        # For list view, only show top-level comments (no parent)
        if self.action == 'list':
            post_id = self.request.query_params.get('post')
            if post_id:
                queryset = queryset.filter(post_id=post_id, parent__isnull=True)
            else:
                queryset = queryset.filter(parent__isnull=True)
        
        return queryset

    def perform_create(self, serializer):
        """Set the author to the current user"""
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'], url_path='post/(?P<post_id>[^/.]+)')
    def post_comments(self, request, post_id=None):
        """Get all comments for a specific post"""
        post = get_object_or_404(Post, id=post_id)
        
        # Get top-level comments for the post
        comments = Comment.objects.filter(
            post=post, 
            parent__isnull=True
        ).select_related('author').order_by('-created_at')
        
        page = self.paginate_queryset(comments)
        if page is not None:
            serializer = CommentSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)