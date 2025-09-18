from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from apps.common.permissions import IsOwner
from apps.common.pagination import StandardResultsSetPagination
from .models import User
from .serializers import (
    UserSerializer, UserProfileSerializer, PublicUserSerializer,
    UserUpdateSerializer, ChangePasswordSerializer
)


class UserViewSet(ModelViewSet):
    """ViewSet for User model"""
    queryset = User.objects.filter(is_active=True)
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'me':
            return UserProfileSerializer
        elif self.action == 'update_me':
            return UserUpdateSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        elif self.action in ['retrieve', 'list']:
            return PublicUserSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['me', 'update_me', 'change_password', 'my_posts', 'my_bookmarks', 'my_likes']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_me(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return updated profile with stats
        profile_serializer = UserProfileSerializer(request.user)
        return Response(profile_serializer.data)

    @action(detail=False, methods=['put'])
    def change_password(self, request):
        """Change user password"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password updated successfully'})

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Get user's published posts"""
        user = self.get_object()
        from apps.posts.models import Post
        from apps.posts.serializers import PostSerializer
        
        posts = Post.objects.filter(
            author=user, 
            is_published=True
        ).select_related('author', 'category').order_by('-created_at')
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response({
                'user': PublicUserSerializer(user).data,
                'posts': serializer.data
            })
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response({
            'user': PublicUserSerializer(user).data,
            'posts': serializer.data
        })

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """Get current user's posts (including unpublished)"""
        from apps.posts.models import Post
        from apps.posts.serializers import PostSerializer
        
        status_filter = request.query_params.get('status')
        posts = Post.objects.filter(author=request.user)
        
        if status_filter == 'published':
            posts = posts.filter(is_published=True)
        elif status_filter == 'draft':
            posts = posts.filter(is_published=False)
        
        posts = posts.select_related('author', 'category').order_by('-created_at')
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_bookmarks(self, request):
        """Get current user's bookmarked posts"""
        from apps.posts.models import Bookmark
        from apps.posts.serializers import PostSerializer
        
        bookmarks = Bookmark.objects.filter(
            user=request.user
        ).select_related('post__author', 'post__category').order_by('-created_at')
        
        page = self.paginate_queryset(bookmarks)
        if page is not None:
            bookmarks_data = []
            for bookmark in page:
                post_serializer = PostSerializer(bookmark.post, context={'request': request})
                bookmarks_data.append({
                    'bookmarked_at': bookmark.created_at,
                    'post': post_serializer.data
                })
            return self.get_paginated_response(bookmarks_data)
        
        bookmarks_data = []
        for bookmark in bookmarks:
            post_serializer = PostSerializer(bookmark.post, context={'request': request})
            bookmarks_data.append({
                'bookmarked_at': bookmark.created_at,
                'post': post_serializer.data
            })
        return Response(bookmarks_data)

    @action(detail=False, methods=['get'])
    def my_likes(self, request):
        """Get current user's liked posts"""
        from apps.posts.models import Like
        from apps.posts.serializers import PostSerializer
        
        likes = Like.objects.filter(
            user=request.user
        ).select_related('post__author', 'post__category').order_by('-created_at')
        
        page = self.paginate_queryset(likes)
        if page is not None:
            likes_data = []
            for like in page:
                post_serializer = PostSerializer(like.post, context={'request': request})
                likes_data.append({
                    'liked_at': like.created_at,
                    'post': post_serializer.data
                })
            return self.get_paginated_response(likes_data)
        
        likes_data = []
        for like in likes:
            post_serializer = PostSerializer(like.post, context={'request': request})
            likes_data.append({
                'liked_at': like.created_at,
                'post': post_serializer.data
            })
        return Response(likes_data)