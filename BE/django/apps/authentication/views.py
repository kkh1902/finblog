from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema
from .serializers import (
    RegisterSerializer, LoginSerializer, TokenRefreshResponseSerializer,
    LoginResponseSerializer
)
from apps.users.serializers import UserSerializer


def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'token_type': 'bearer'
    }


@extend_schema(
    request=RegisterSerializer,
    responses={201: UserSerializer},
    summary="Register a new user",
    description="Create a new user account"
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_serializer = UserSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=LoginSerializer,
    responses={200: LoginResponseSerializer},
    summary="Login user",
    description="Authenticate user and return JWT tokens"
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """Login user and return JWT tokens"""
    serializer = LoginSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        
        return Response({
            **tokens,
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenRefreshView(TokenRefreshView):
    """Custom token refresh view with proper response format"""
    
    @extend_schema(
        responses={200: TokenRefreshResponseSerializer},
        summary="Refresh JWT token",
        description="Get a new access token using refresh token"
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Reformat response to match other backends
            data = response.data
            response.data = {
                'access_token': data['access'],
                'refresh_token': data.get('refresh', request.data.get('refresh')),
                'token_type': 'bearer'
            }
        return response


@extend_schema(
    responses={200: UserSerializer},
    summary="Get current user",
    description="Get the currently authenticated user's profile"
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)