from rest_framework import serializers
from apps.users.serializers import UserSummarySerializer
from apps.categories.serializers import CategorySummarySerializer
from .models import Post, Tag, Like, Bookmark


class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag model"""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model"""
    author = UserSummarySerializer(read_only=True)
    category = CategorySummarySerializer(read_only=True)
    tags = serializers.StringRelatedField(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    comment_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'category', 'author', 'tags', 'tag_names',
            'view_count', 'like_count', 'comment_count', 'is_published',
            'is_liked', 'is_bookmarked', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'author', 'view_count', 'like_count', 'comment_count',
            'is_liked', 'is_bookmarked', 'created_at', 'updated_at'
        ]

    def get_is_liked(self, obj):
        """Check if current user liked this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_liked_by(request.user)
        return False

    def get_is_bookmarked(self, obj):
        """Check if current user bookmarked this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_bookmarked_by(request.user)
        return False

    def create(self, validated_data):
        """Create post with tags"""
        tag_names = validated_data.pop('tag_names', [])
        post = Post.objects.create(**validated_data)
        
        # Create or get tags and associate with post
        for tag_name in tag_names:
            tag, created = Tag.objects.get_or_create(name=tag_name.strip())
            post.tags.add(tag)
        
        return post

    def update(self, instance, validated_data):
        """Update post with tags"""
        tag_names = validated_data.pop('tag_names', None)
        
        # Update post fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_names is not None:
            instance.tags.clear()
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)
        
        return instance


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating posts"""
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = Post
        fields = ['title', 'content', 'category', 'tag_names', 'is_published']

    def validate_title(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def validate_content(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Content cannot be empty.")
        return value.strip()

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        post = Post.objects.create(**validated_data)
        
        for tag_name in tag_names:
            tag, created = Tag.objects.get_or_create(name=tag_name.strip())
            post.tags.add(tag)
        
        return post

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tag_names is not None:
            instance.tags.clear()
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)
        
        return instance


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for Like model"""
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for Bookmark model"""
    
    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']