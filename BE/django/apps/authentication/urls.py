from django.urls import path
from .views import register, login, CustomTokenRefreshView, me

urlpatterns = [
    path('register/', register, name='auth-register'),
    path('login/', login, name='auth-login'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='auth-refresh'),
    path('me/', me, name='auth-me'),
]