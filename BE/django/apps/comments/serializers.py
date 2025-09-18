from rest_framework import serializers
from apps.users.serializers import UserSummarySerializer
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""
    author = UserSummarySerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'post', 'author', 'parent', 
            'created_at', 'updated_at', 'replies'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'replies']

    def get_replies(self, obj):
        """Get nested replies for this comment"""
        if obj.parent is None:  # Only include replies for top-level comments
            replies = obj.get_replies()
            return CommentSerializer(replies, many=True, context=self.context).data
        return []

    def validate_content(self, value):
        """Validate comment content"""
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Content cannot be empty.")
        if len(value) > 2000:
            raise serializers.ValidationError("Content too long (max 2000 characters).")
        return value.strip()

    def validate(self, attrs):
        """Validate comment data"""
        post = attrs.get('post')
        parent = attrs.get('parent')
        
        # If parent is specified, ensure it belongs to the same post
        if parent and parent.post != post:
            raise serializers.ValidationError("Parent comment must be from the same post.")
        
        return attrs


class CommentCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating comments"""
    
    class Meta:
        model = Comment
        fields = ['content', 'post', 'parent']

    def validate_content(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Content cannot be empty.")
        if len(value) > 2000:
            raise serializers.ValidationError("Content too long (max 2000 characters).")
        return value.strip()

    def validate(self, attrs):
        post = attrs.get('post')
        parent = attrs.get('parent')
        
        if parent and parent.post != post:
            raise serializers.ValidationError("Parent comment must be from the same post.")
        
        return attrs