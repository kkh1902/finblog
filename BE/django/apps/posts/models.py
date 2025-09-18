from django.db import models
from django.conf import settings
from apps.common.models import TimestampedModel
from apps.categories.models import Category


class Tag(TimestampedModel):
    """Tag model for categorizing posts"""
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'tags'
        ordering = ['name']

    def __str__(self):
        return self.name


class Post(TimestampedModel):
    """Post model for blog posts"""
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['category']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_published']),
        ]

    def __str__(self):
        return self.title

    @property
    def comment_count(self):
        """Get the number of comments for this post"""
        return self.comments.count()

    def increment_view_count(self):
        """Increment the view count"""
        self.view_count = models.F('view_count') + 1
        self.save(update_fields=['view_count'])
        self.refresh_from_db()

    def update_like_count(self):
        """Update like count based on actual likes"""
        self.like_count = self.likes.count()
        self.save(update_fields=['like_count'])

    def is_liked_by(self, user):
        """Check if user has liked this post"""
        if user.is_authenticated:
            return self.likes.filter(user=user).exists()
        return False

    def is_bookmarked_by(self, user):
        """Check if user has bookmarked this post"""
        if user.is_authenticated:
            return self.bookmarks.filter(user=user).exists()
        return False


class Like(TimestampedModel):
    """Like model for post likes"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes'
    )

    class Meta:
        db_table = 'likes'
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.user.username} likes {self.post.title}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update post like count
        self.post.update_like_count()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        # Update post like count
        self.post.update_like_count()


class Bookmark(TimestampedModel):
    """Bookmark model for saving posts"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )

    class Meta:
        db_table = 'bookmarks'
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['post']),
        ]

    def __str__(self):
        return f'{self.user.username} bookmarked {self.post.title}'