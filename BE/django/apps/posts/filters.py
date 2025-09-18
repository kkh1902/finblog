import django_filters
from .models import Post


class PostFilter(django_filters.FilterSet):
    """Filter for Post model"""
    category = django_filters.NumberFilter(field_name='category__id')
    author = django_filters.NumberFilter(field_name='author__id')
    tags = django_filters.CharFilter(method='filter_by_tags')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Post
        fields = ['category', 'author', 'tags', 'created_after', 'created_before']

    def filter_by_tags(self, queryset, name, value):
        """Filter posts by tag names (comma-separated)"""
        if value:
            tag_names = [tag.strip() for tag in value.split(',')]
            return queryset.filter(tags__name__in=tag_names).distinct()
        return queryset