# accounts/views.py
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import User
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

User = get_user_model()
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    if not request.user.is_staff:
        return Response({"detail": "Not allowed"}, status=403)

    users = User.objects.all().values('id', 'email')
    return Response(users)

@api_view(['POST'])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({'detail': 'Email and password are required'}, status=400)
    
    if User.objects.filter(email=email).exists():
        return Response({'detail': 'User already exists'}, status=400)
    
    user = User.objects.create_user(email=email, password=password)
    return Response({'email': user.email, 'id': user.id})

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "is_staff": user.is_staff,
        })