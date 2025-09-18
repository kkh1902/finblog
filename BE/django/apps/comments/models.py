from django.db import models
from django.conf import settings
from apps.common.models import TimestampedModel
from apps.posts.models import Post


class Comment(TimestampedModel):
    """Comment model for post comments"""
    content = models.TextField(max_length=2000)
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )

    class Meta:
        db_table = 'comments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['author']),
            models.Index(fields=['parent']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'

    @property
    def is_reply(self):
        """Check if this comment is a reply to another comment"""
        return self.parent is not None

    def get_replies(self):
        """Get all replies to this comment"""
        return self.replies.all().select_related('author').order_by('created_at')