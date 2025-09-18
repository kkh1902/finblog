from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    post_count = serializers.ReadOnlyField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color', 'created_at', 'post_count']
        read_only_fields = ['id', 'created_at', 'post_count']

    def validate_name(self, value):
        """Check that category name is not already taken"""
        instance = getattr(self, 'instance', None)
        if instance:
            # For updates, exclude current instance
            if Category.objects.exclude(pk=instance.pk).filter(name=value).exists():
                raise serializers.ValidationError("Category with this name already exists.")
        else:
            # For creation
            if Category.objects.filter(name=value).exists():
                raise serializers.ValidationError("Category with this name already exists.")
        return value


class CategorySummarySerializer(serializers.ModelSerializer):
    """Minimal category serializer for nested representations"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'color']