# accounts/urls.py
from django.urls import path
from .views import register_user,MeView,user_list

urlpatterns = [
    path('register/', register_user, name='register'),
    path('auth/me/', MeView.as_view()),
    path('users/', user_list),
    # path('auth/login/', login_view, name='login'),
]
