from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'nickname', 'avatar_url', 
            'bio', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with stats"""
    stats = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'nickname', 'avatar_url', 
            'bio', 'is_active', 'created_at', 'updated_at', 'stats'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'stats']

    def get_stats(self, obj):
        return obj.get_stats()


class PublicUserSerializer(serializers.ModelSerializer):
    """Serializer for public user profile"""
    stats = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'nickname', 'avatar_url', 
            'bio', 'created_at', 'stats'
        ]
        read_only_fields = ['id', 'created_at', 'stats']

    def get_stats(self, obj):
        # Only return public stats
        return {
            'posts_count': obj.posts.filter(is_published=True).count(),
            'comments_count': obj.comments.count(),
        }


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = ['email', 'nickname', 'avatar_url', 'bio']

    def validate_email(self, value):
        """Check that email is not already taken by another user"""
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email already taken.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        return attrs


class UserSummarySerializer(serializers.ModelSerializer):
    """Minimal user serializer for nested representations"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'nickname', 'avatar_url']