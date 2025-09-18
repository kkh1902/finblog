from django.db import models
from django.core.validators import RegexValidator
from apps.common.models import TimestampedModel


class Category(TimestampedModel):
    """Category model for organizing posts"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(max_length=500, blank=True)
    color = models.CharField(
        max_length=7,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^#[0-9A-Fa-f]{6}$',
                message='Color must be a valid hex color (e.g., #FF0000)'
            )
        ],
        help_text='Hex color code (e.g., #FF0000)'
    )

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def post_count(self):
        """Get the number of published posts in this category"""
        return self.posts.filter(is_published=True).count()