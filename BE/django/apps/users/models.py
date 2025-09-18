from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.common.models import TimestampedModel


class User(AbstractUser, TimestampedModel):
    """
    Custom User model for FinBoard
    """
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=50, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)

    # Use email as the unique identifier
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

    @property
    def display_name(self):
        return self.nickname or self.username

    def get_stats(self):
        """Get user statistics"""
        from apps.posts.models import Post
        from apps.comments.models import Comment
        
        return {
            'posts_count': self.posts.filter(is_published=True).count(),
            'comments_count': self.comments.count(),
            'likes_count': self.likes.count(),
            'bookmarks_count': self.bookmarks.count(),
        }