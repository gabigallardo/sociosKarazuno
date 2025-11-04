import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from socios.models import Usuario
from socios.serializers import RegisterSerializer, UsuarioSerializer


class LoginView(APIView):
    """Vista para autenticación de usuarios"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        contrasena = request.data.get("contrasena")

        if not email or not contrasena:
            return Response(
                {"error": "Email y contraseña requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Email no registrado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not check_password(contrasena, usuario.contrasena):
            return Response(
                {"error": "Contraseña incorrecta"},
                status=status.HTTP_400_BAD_REQUEST
            )

        roles = list(usuario.roles.values_list('nombre', flat=True))
        payload = {
            "id": usuario.id,
            "email": usuario.email,
            "roles": roles,
            "exp": datetime.utcnow() + timedelta(hours=2),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        # El serializer se encarga de construir el objeto JSON correctamente,
        # incluyendo el campo anidado 'socioinfo'.
        serializer = UsuarioSerializer(usuario)

        return Response({
            "token": token,
            "usuario": serializer.data
        })


class RegisterView(APIView):
    """Vista para registro de nuevos usuarios"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Usuario registrado correctamente."},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )